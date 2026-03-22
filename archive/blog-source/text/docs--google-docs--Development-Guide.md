# Development Guide

**Source:** google-docs

---

Great. I’ll develop a full architectural and development blueprint for BlackRoad.io and BlackRoadInc.us.

This will include:

Functional layout for both portals (creation hub vs. financial/investor/backend)

Tech stack, deployment, NGINX proxy, SSL and port mappings

Suggested module/file structure for Lucidia chat, RoadView, on-screen co-coding, AI memory

Interaction model across conversations, user sessions, and cross-product integration (like Salesforce + Zoom + GitHub)

I’ll break this down step-by-step and return with a plan ready to be implemented layer-by-layer, starting from login outward.

BlackRoad Ecosystem Architecture Plan

Overview

The BlackRoad ecosystem is composed of two interconnected web portals, each with distinct roles:

BlackRoad.io – A creative AI interface and content hub for users. It features an AI-driven workspace (Lucidia AI), collaborative coding, media sharing (RoadView video platform), a social forum (RoadBook), and chat/session memory. All non-financial creative tools reside here.

BlackRoadInc.us – A blockchain and investor portal. It manages the RoadCoin cryptocurrency and wallet UI, the RoadChain decentralized logic (smart contracts or blockchain network), investor relations dashboards, compliance (RIA integration), and secure login services (Lucidia Single Sign-On). It also handles deployment concerns (NGINX reverse proxy, SSL, PM2, Docker) for the whole ecosystem.

Despite separate domains, the two portals share a unified authentication system (Lucidia SSO) and complementary functionality. BlackRoad.io provides the user-facing creation and AI features, while BlackRoadInc.us provides financial and infrastructure services. The architecture emphasizes modular growth, security, and seamless user experience across both sites.

Recommended Tech Stack

Front-End & UI: We recommend using React with Next.js for both portals’ front ends. Next.js provides server-side rendering (SSR) and a robust React framework, which is ideal for dynamic, interactive applications. SSR can improve performance and SEO (relevant for public content on RoadView/RoadBook) and offers built-in routing and API endpoints. React’s component model will let us reuse UI elements across features, while Next’s flexibility supports hybrid pages (some fully client-side for the app-like experience). Styling will use Tailwind CSS, a utility-first CSS framework that enables rapid UI development directly in markup, ensuring a consistent design across the ecosystem.

Back-End & Services: On the server side, we will use Node.js for its high concurrency and real-time capabilities, crucial for features like multi-user collaboration and live content updates. Each portal runs as a Node application (each behind its own port). We can implement the back-end with a lightweight framework like Express (or Next.js API routes) for routing and API endpoints. Node’s ecosystem has excellent libraries for WebSockets (real-time co-coding), blockchain integration (e.g. web3/ethers for RoadChain), and calling AI services.

Rationale: Using Node/JavaScript end-to-end ensures consistency (same language for front and back). Node excels at handling concurrent connections and real-time events (important for collaborative editing and chat), while Python (Flask/FastAPI) is strong for AI/ML but can be integrated as needed. If heavy AI model processing is required server-side, we could introduce a microservice in Python (FastAPI) for those tasks – but initially Node can call out to AI APIs or services. Node’s performance and non-blocking I/O suit our web app’s needs for speed and interaction. Python’s rich AI libraries might be used offline or in training phases, but for the web service portion Node keeps latency low.

AI Integration: The Lucidia AI engine (chat and co-coder) will likely use external AI APIs or a hosted model. For the user-facing chat and coding assistant, we can use an API wrapper (in Node or Python) to OpenAI or similar LLMs. The Lucidia chat memory component will manage context (possibly with a Python service using libraries like LangChain, if needed, due to Python’s AI tooling). However, initially we can manage context with Node (storing conversations in a database and embedding vectors for long-term memory). The AI suggestions for code can be fetched via REST calls to an AI service.

Blockchain Integration: RoadChain (and RoadCoin) logic will be handled by blockchain frameworks. We might deploy an Ethereum-based sidechain or use a library like web3.js in Node to interact with smart contracts (for coin transactions, staking, etc.). Node has mature support for blockchain interactions, and using Node on BlackRoadInc.us means the portal can directly communicate with the chain or node. If we choose a custom blockchain, a service (could be in Node or Rust depending on chain tech) will run the network logic. For the web portal, Node/Express will provide APIs to query balances, send transactions, etc., using secure keys and wallet integration.

Database: We will use a persistent database for user data, content, and history. Likely PostgreSQL (relational) or MongoDB (document) for storing user profiles, posts (RoadBook threads), video metadata, transaction records, etc. For chat/coding session history and AI memory, a combination of a NoSQL store or vector database (for embeddings) can be used to enable semantic searches of past conversations. We’ll also use Redis or similar in-memory store for caching and fast session lookup (especially for tokens and cross-site sessions).

Styling & UX: Tailwind CSS will ensure a rapid and consistent design system. We will also employ component libraries or design frameworks as needed (e.g., maybe headless UI components for modals, or D3.js for any visualizations like the RoadChain market graph). The UI will be responsive and modern, matching the provided design mockups.

Summary of Stack:

BlackRoad.io: Next.js (React + Node) app, Tailwind CSS UI, uses WebSockets for collab, calls AI APIs for Lucidia. Runs on internal port 9000.

BlackRoadInc.us: Next.js (or Express/Node) app for investor portal, possibly with some server-rendered pages for wallets/transactions, integrates with blockchain nodes via Node libraries. Runs on port 8000.

Shared: Node-based microservices or modules for authentication (Lucidia SSO), plus a common database. Optionally, a Python service for advanced AI processing if needed, but not required initially.

Development tooling: Use TypeScript for type safety in Node/React code. Use ESLint/Prettier for code quality. We might use PM2 for process management in production and Docker for containerization (for consistent deployment if needed).

Cross-Site Session & Token Management (Lucidia SSO)

Managing authentication across two separate domains (.io and .us) requires a robust single sign-on solution. We will implement Lucidia SSO – a centralized authentication service (built into BlackRoadInc.us or a dedicated service) that both portals trust. The key is to use token-based auth (JWT) and a common identity store.

Central Identity Service: When a user attempts to log in on either site, they will be redirected to a central auth endpoint (e.g., an SSO subdomain like auth.blackroadinc.us or simply the blackroadinc.us login page, since BlackRoadInc handles secure login). The user enters credentials once, and the service validates them (checking the shared user database). Upon success, the SSO service issues a signed JWT token (or session cookie) that encodes the user’s identity and permissions.

JWT Tokens: We use JWT for stateless, shareable auth. The JWT will be signed (using HMAC or RSA) so both portals can verify it. The token is not shared via cookies across domains (same-site policy prevents that). Instead, after login, the user is redirected back to the originating site with the token in the URL fragment or via a POST message. The site’s script then stores the token (likely in localStorage for persistence or a cookie scoped to that domain). All subsequent API requests include this JWT (in Authorization header) so the back-end can validate and identify the user.

SSO Flow: If a logged-in user navigates to the other portal (say a user logged into BlackRoad.io goes to BlackRoadInc.us), we want to avoid a second login prompt. There are two possible solutions:

SSO Redirect: BlackRoadInc.us detects no local session, so it redirects to the central SSO (with a parameter saying “I have a token?”). The SSO server sees that the user already has an active session (from a prior login, e.g., via an SSO cookie or stored session). It then immediately redirects back with a new JWT for BlackRoadInc.us. This way, the user seamlessly gains access using the same credentials (the SSO cookie on the central domain lets them avoid re-entering credentials).

Invisible SSO via iframe: To avoid even a redirect flash, BlackRoadInc.us can embed a hidden iframe pointing to the SSO domain. That iframe can read the existing token from the central domain (since it’s same-origin for SSO) and then use postMessage to send the token to BlackRoadInc.us parent window. This technique allows sharing the login state silently, as long as we trust the domains (which we do in this ecosystem).

Token Security: The JWTs will contain minimal info (user ID, roles) and an expiry (e.g., 1 hour). We will implement refresh tokens or re-authentication after expiry. All communication will be over HTTPS, and JWTs will be verified by each site’s backend using the shared secret or public key. Because localStorage is used for persistence, we must guard against XSS to protect the token. Alternatively, we can issue an HTTP-only cookie from the SSO domain for each site’s domain (if using a wildcard domain or subdomains – not the case here since domains differ). Thus, JWT + localStorage with robust XSS protections is our approach.

Lucidia AI Integration: The login system will also integrate with the Lucidia AI persona – e.g., greeting the user by name and personalizing the AI memory store per user. The SSO will interface with the Lucidia memory service to pull in any user-specific context (like past interactions summary) upon login. This ties the user’s identity to their AI data.

Logout and Sync: A unified logout will be implemented. If the user logs out from one portal, we redirect to SSO to log out centrally (clearing the SSO cookie or session) and inform the other domain to clear its local token (perhaps via a logout endpoint or script). This ensures no dangling sessions.

In summary, Lucidia SSO provides a single set of credentials and a unified session across BlackRoad.io and BlackRoadInc.us. This creates a seamless experience: the user logs in once to access both creative and financial features. We achieve this via JWT tokens and either redirect or iframe-based token sharing, following industry best practices for cross-domain SSO.

File & Folder Structure

We will organize the code in a way that separates concerns and supports future scalability. Each portal is its own project, but a common structure and possibly a monorepo can ease shared development.

/BlackRoadProject        (Optional monorepo root)

│

├── blackroad-io-portal/     (BlackRoad.io codebase)

│   ├── pages/ or src/       (Next.js pages or React app entry points)

│   │   ├── index.js         (Lucidia AI homepage)

│   │   ├── roadview/        (Pages for RoadView video section)

│   │   ├── roadbook/        (Pages for RoadBook social section)

│   │   ├── cocoding/        (Pages or components for co-coding environment)

│   │   └── api/             (Next.js API routes for backend logic, e.g., chat, code AI calls)

│   ├── components/          (Reusable UI components e.g., Navbar, VideoCard, PostList)

│   ├── styles/              (Tailwind CSS configuration, global styles)

│   ├── utils/               (Utility modules, e.g., auth helpers to check JWT, AI helpers)

│   ├── public/              (Static assets)

│   ├── package.json, next.config.js, tailwind.config.js, etc.

│   └── ... (other config like tsconfig.json)

│

└── blackroadinc-portal/     (BlackRoadInc.us codebase)

├── pages/ or src/       (If Next.js or a Node/Express app views)

│   ├── index.js         (Landing or Dashboard page – maybe showing RoadChain summary)

│   ├── wallet/          (User wallet and balance page)

│   ├── invest/          (Investor relations pages, compliance docs, etc.)

│   ├── admin/           (Admin or RIA management pages if any)

│   └── api/             (API routes e.g., to get balances, perform transactions)

├── components/          (UI components for investor portal, e.g., graphs, transaction list)

├── blockchain/          (Modules for blockchain integration: e.g., web3 setup, contract ABIs)

├── utils/               (Auth, validation, common helpers)

├── config/              (Config files, e.g., keys, network config for RoadChain)

└── package.json, etc.

Separation of Concerns: Each portal has its own isolated codebase to deploy independently (they run on different ports). Shared logic (like SSO validation, model definitions) can either be factored into a small shared library or duplicated in a controlled way. If using a monorepo, we could have a common/ directory for shared code (e.g., a auth.js module that both import, or shared UI components if styles need to match exactly). This prevents divergence in how tokens are verified or how UI looks.

Scalability: The folder structure groups features (feature-based organization). This makes it easy to extend. For example, adding a new creative tool on BlackRoad.io might mean adding a new section under pages/ and corresponding components. Similarly, if a new blockchain feature (say, a staking interface) is added to BlackRoadInc, it can go under pages/stake/ and use components from components/. The use of Next.js means each page can have its own server-side logic if needed (via getServerSideProps) or use the API routes for data.

AI and Data Files: Any persistent data (user uploads, AI fine-tuned models, etc.) will be stored in appropriate directories or external storage. E.g., uploaded videos might be stored on an S3 bucket or in a media/ folder on a CDN, with references in the database. The code repository itself will contain only code, not large media files.

Testing: We will include tests directory or patterns (like __tests__/ for unit tests of key logic, e.g., SSO token functions, and integration tests for API endpoints). This ensures each piece works in isolation.

Configuration: Sensitive config (API keys, DB passwords, JWT secrets) will not be in the repo but in environment variables (.env files). Each portal can have its own .env, and possibly a root .env for shared settings like database URL if they share a database.

This structure ensures that developers can work on the BlackRoad.io front-end without touching the investor portal, and vice versa, except via well-defined interfaces (like the SSO). It also allows deploying updates to one portal independently. As the project grows, we could even split into separate repositories or microservices (for example, spin out the RoadChain blockchain service as its own project).

Integration with PM2, NGINX, SSL, and Docker

Deployment will use a robust production setup with NGINX as a reverse proxy, PM2 for process management, and SSL termination for security.

Reverse Proxy (NGINX): We will use NGINX to route external traffic to the correct Node app. For example, requests to https://blackroad.io/* will be forwarded to the BlackRoad.io Node server (running on internal port 9000), and requests to https://blackroadinc.us/* go to the investor Node server (port 8000). NGINX will also handle redirecting HTTP to HTTPS. A sample configuration is:

 server {

listen 80;

server_name blackroad.io www.blackroad.io;

return 301 https://$host$request_uri;

}

server {

listen 443 ssl http2;

server_name blackroad.io www.blackroad.io;

ssl_certificate     /etc/letsencrypt/live/blackroad.io/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/blackroad.io/privkey.pem;

location / {

proxy_pass http://127.0.0.1:9000;  # BlackRoad.io app on 9000

include proxy_params;

}

}

server {

listen 80;

server_name blackroadinc.us www.blackroadinc.us;

return 301 https://$host$request_uri;

}

server {

listen 443 ssl http2;

server_name blackroadinc.us www.blackroadinc.us;

ssl_certificate     /etc/letsencrypt/live/blackroadinc.us/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/blackroadinc.us/privkey.pem;

location / {

proxy_pass http://127.0.0.1:8000;  # BlackRoadInc.us app on 8000

include proxy_params;

}

}

This ensures both domains have SSL (using Let’s Encrypt certificates) and are proxied appropriately. NGINX will also be configured with security best practices (rate limiting, payload size limits, etc.) and serve static files efficiently (though Next.js will mostly handle static assets itself or via CDN).

SSL Certificates: We’ll use Let’s Encrypt for free SSL certs, auto-renewed via a cron or Certbot. The above config references the cert/key paths for each domain. All user traffic (login, AI data, transactions) will be encrypted in transit.

PM2 Process Manager: On the server, we run the Node applications with PM2 for reliability. PM2 will daemonize the processes, auto-restart on crashes, and can be set to start on boot. We will have two PM2 app entries: one for blackroad.io app (listening 9000) and one for blackroadinc.us app (listening 8000). Example PM2 startup commands:

 pm2 start npm --name "blackroad.io" -- start  # assuming package.json start script sets port 9000

pm2 start npm --name "blackroadinc.us" -- start

pm2 save  # save the process list

pm2 startup  # generate systemd script for auto-start

Once launched, we can verify both processes are online (as shown in logs). PM2 will keep them alive and respawn if they crash. It also provides logs (pm2 logs) for debugging. We’ll configure each app’s environment (production mode, environment variables) within PM2 or systemd.

Docker (if applicable): We can containerize each portal for consistency across environments. Each would have a Dockerfile (based on node:18-alpine for example), copying the app code and running npm build && npm start. We might also containerize NGINX, or simply run NGINX on the host. In a Docker Compose setup, we’d have three services: nginx, blackroad_io_app, blackroadinc_app. NGINX would link to the app containers by name (instead of 127.0.0.1: use container names). Docker ensures we can replicate the environment locally and in production. However, Docker adds complexity if not needed; since this is a private deployment on a VM (as indicated by using PM2 directly), we might choose to skip Docker in production and use PM2 + systemd directly on the host. In any case, the architecture supports containerization if scaling out or deploying to cloud services.

Ports & Firewall: The Node apps listen on 8000/9000 locally. These ports will be firewalled from public access (only NGINX listens on 80/443 publicly). The server’s ufw/iptables will allow 80/443 and perhaps SSH, but not 8000/9000 from outside. This adds a security layer.

Scaling Considerations: With PM2, we can easily scale the Node processes (e.g., pm2 scale blackroad.io 2 to run two instances) and then use NGINX load balancing if needed. In early stages, likely one instance per app is enough, but PM2 makes it easy to utilize multi-core servers. If a significant load is expected on, say, the AI features, we could scale that horizontally behind NGINX.

Logging & Monitoring: We’ll integrate logging (maybe using Morgan in Node or custom logs) and use PM2’s logs or a log aggregator. Monitoring tools like PM2 web or services like New Relic can be considered to watch memory/CPU. The PM2 status table helps to ensure both apps remain online.

Overall, this deployment setup leverages NGINX for routing and security, SSL for encryption, and PM2 for resilient Node processes, following a standard Node.js production architecture. It ensures that both portals run reliably on one host (or multiple, if expanded later), and that the integration (SSO, API calls) between them remains on secure, internal channels.

Conversation Memory & Persistent AI Context

A core feature of BlackRoad.io is Lucidia, the AI assistant that maintains memory of the conversation and user context. Designing this requires a combination of in-browser state and server-side persistence:

Lucidia Chat Memory: We will implement a memory buffer that retains recent dialogue turns so the AI can generate contextually relevant responses. By default, large language models are stateless – they don’t remember past prompts unless you provide that history with each request. To achieve continuity, the system will maintain a conversation history string (or structured format) that grows with each user message and AI reply. In practice, the client or server will send a window of the last N messages to the AI API on each new prompt. We’ll tune N based on token limits (perhaps the last 10-20 messages, or a summary of older messages plus the last few verbatim).

Long-Term Persistence: For truly persistent memory across sessions, we will store conversation data in a database. For example, when a user ends a chat session, the important details can be saved (perhaps summarized) into a User Memory DB keyed by user ID. Next time they return, Lucidia can greet them and recall previous topics. We might use a vector database (like Pinecone or an open-source equivalent) to store embeddings of past conversations, enabling semantic search for relevant past info. The architecture might include a Memory Service that on a new session loads the user’s recent conversation history and any persistent notes (e.g., if the user told the AI “my favorite color is blue”, that fact is saved and reloaded in context next time). This approach gives a continuity of personality and knowledge for the AI beyond just the immediate session.

Session History UI: Within BlackRoad.io, we’ll have a UI (Lucidia chat history panel) that shows past sessions or threads. The backend stores each chat session (date, title or summary) so the user can click an old conversation and resume it. This requires endpoints to save and fetch conversation logs. We’ll implement this as part of the RoadBook social layer or as a separate service.

Co-Coding Environment: The on-screen collaborative coding feature is another place where state and memory matter. We will integrate a code editor (likely Monaco Editor for a rich IDE-like experience in the browser). Multi-user collaboration will be enabled via WebSockets (using Socket.io on Node). When two or more users are in the same coding session, their editors will sync in real-time. We will use Operational Transform or CRDT algorithms to merge edits without conflict, ensuring all participants see the same code in real time. The server will act as the coordinator to broadcast changes to all clients. This is similar to how Google Docs collaboration works – each keystroke is sent to the server, which then emits it to other clients, possibly transforming it if out of order. Because this is a complex domain, we might leverage existing libraries (e.g., Y.js or ShareDB for CRDT) to handle the OT/CRDT logic.

AI Assistance in Coding: Lucidia will assist in coding sessions by offering code completions, function suggestions, or debugging tips. When the user invokes the AI (say by a prompt or a special comment), the code context (current file or selection) will be sent to the AI backend. The suggestion returned will be inserted or shown to users (with options to accept/modify). This requires the code editor to interface with the AI service – likely via an API call that sends the code snippet and prompt. We’ll ensure the AI has enough context (maybe the entire file or relevant parts) in its prompt for accuracy.

File Management: The workspace may allow multiple files (like a mini IDE). We will maintain the file tree in the browser and possibly sync it to the server for persistence. The server can store project files in a temporary directory or database. Persistent storage might be needed if users save projects. This could tie into RoadBook (e.g., posting a code snippet to RoadBook forum or saving to their profile).

Scalability & Performance: Real-time collaboration and AI calls can be resource-heavy. We will partition these tasks: the WebSocket server for collaboration might be a separate instance or process (to be scalable, could use a separate Node process or cluster just for Socket.io). The AI calls will likely go to external APIs that scale independently. We must ensure not to block the Node event loop; heavy tasks like AI computation (if any on our side) should be offloaded (maybe to a Python service or a background job). Using Next.js API routes (which run on Node) is fine for quick calls to external APIs, but anything long-running might need a message queue or background worker strategy.

Data Persistence: For RoadView and RoadBook – these are user content that require storage. RoadView (video content) will either store videos on a cloud storage and use our database to index them (title, URL, etc.). RoadBook posts and comments will be stored in a database (SQL tables like Posts, Comments, with user references). We’ll build APIs to fetch feeds (e.g., RoadBook homepage shows recent posts or AI-curated content). Possibly, Lucidia AI could help moderate or curate RoadBook (flagging inappropriate content, or highlighting posts based on user interests).

Analytics and Logging: We will track user interactions with the AI and coding features for improving the system. E.g., log how often suggestions are accepted, or which queries fail, to continuously refine Lucidia.

In essence, Lucidia’s memory subsystem ensures the AI in BlackRoad.io offers a continuous, personalized experience, turning the stateless nature of LLMs into a stateful conversational agent. Combined with the collaborative tools, this makes BlackRoad.io a powerful creation hub with both human and AI memory at work.

Example of the Lucidia AI interface on BlackRoad.io. The user can “ask anything...” via the prompt bar, and Lucidia (the AI) responds conversationally. Different modes like Advanced, Symbolic, Analytics, App are available (buttons at bottom) to tailor the AI’s behavior for various creative tasks. The interface will display the ongoing conversation and allow context-based interactions, backed by the memory system described.

Major Components and Ownership

Below is a table of the major system components and which portal owns or hosts them:

Note: Some components are shared logically even if hosted on one side. For instance, the SSO is listed under BlackRoadInc.us because that portal manages auth, but the login UI might be accessible from both. Similarly, RoadChain nodes might be separate from the web portal but are a backend service under BlackRoadInc’s domain of responsibility.

Prototype of the RoadBook social feed on BlackRoad.io. This component (owned by the creative portal) shows how users can post status updates, with AI potentially enhancing content discovery. The UI resembles a hybrid of social platforms, and would be backed by the RoadBook service in the BlackRoad.io codebase.

Prototype of the RoadChain wallet dashboard on BlackRoadInc.us. This investor-side component displays a user’s RoadCoin balance, market info, and transaction history. It belongs to the blockchain portal and interacts with the RoadChain backend. The “Send/Receive” and “Stake” functionalities in the UI correspond to blockchain transactions handled by the RoadChain component of the architecture.

User Login & Navigation Flows

Login → Creation Flow (BlackRoad.io): This flow covers a user accessing the creative portal and using its features after authentication.

User visits BlackRoad.io – The user navigates to https://blackroad.io in a browser. The front-end loads and immediately checks if the user is already logged in (e.g., it looks for a valid JWT token in localStorage).

Not Logged In – If no valid session is found, the app redirects the user to the Lucidia SSO login page (on BlackRoadInc.us domain) or opens a login modal that actually communicates with the SSO service. For example, the user might be sent to https://blackroadinc.us/login?redirect=blackroad.io.

SSO Authentication – On the SSO page, the user enters credentials (username/password, or uses OAuth if we integrate third-party login). The credentials are verified against the central user database. On success, the SSO service issues a JWT token for the user and sets a session cookie for itself (to remember this login for subsequent SSO requests).

Redirect back – The user is redirected back to BlackRoad.io with the JWT. BlackRoad.io receives this token (either via URL param or via the postMessage technique). The BlackRoad.io front-end stores the token and considers the user logged in.

Loading AI Context – Immediately after login, the BlackRoad.io app calls an API (to BlackRoad.io backend) to fetch the user’s AI context and last session info (via Lucidia memory service). It might display a personalized greeting like “Welcome back, [Name]!” and preload any content (e.g., their last RoadBook post or a summary of last chat).

Access to Creation Features – The user can now access all sections:

They open RoadView to watch or upload videos. The request goes to a Next.js page which calls an API to list videos (only allowed because user is auth’d). They can also post new videos.

They switch to RoadBook to view or write posts. The SPA (single-page app) navigation in React loads the RoadBook component, which fetches posts via API (including any AI-curated highlights). The JWT is sent with these API calls for auth. They make a post; the backend records it and maybe uses Lucidia AI to analyze or tag it.

They start a Lucidia chat. The chat component is already loaded (maybe the homepage is the chat). As they send messages, the front-end includes the JWT so the server knows which user’s context to use. The AI responds using that context. This continues in real-time.

They open the Co-Coding environment. The app either opens a new collaborative session (generating a session ID) or joins an existing one. The front-end connects via WebSocket to the co-coding server (which authenticates the user by a token or a query param containing the JWT). The user writes code; if they invite someone or if the session is public, others join and code in real-time. At some point they click an “Ask AI” button in the code editor; the front-end sends the code and prompt to an AI API route, which returns a suggestion displayed in the editor.

Continuous Session – Throughout, the JWT token might be set to expire after, say, 1 hour. As it nears expiry, the client could proactively refresh it by silently hitting a refresh endpoint on SSO (if a refresh token is available) or prompt the user to log in again. Because of SSO, re-login might be seamless if their SSO cookie is still valid.

Logout (optional) – If the user logs out on BlackRoad.io, we trigger a logout on SSO as well. This might redirect the user to a confirmation on the SSO domain then back to a logged-out state on BlackRoad.io. The user is now anonymous and can only see public content until they log in again.

Login → Investment Flow (BlackRoadInc.us): This flow is for a user accessing the investor portal, possibly after using the creation portal.

User visits BlackRoadInc.us – The user goes to https://blackroadinc.us (maybe by clicking an “Investor Dashboard” link from BlackRoad.io or directly). The portal loads and checks for a JWT or session cookie.

SSO Check – If the user has recently logged in via SSO (for BlackRoad.io), they might not have a local token for .us domain yet. The BlackRoadInc portal will either find no token and initiate the SSO login, or it could detect an SSO cookie via an iframe. Assuming no immediate token, the user is redirected to the Lucidia SSO login (or a silent handshake).

Seamless Login – Since the user already authenticated moments ago on BlackRoad.io, the SSO service sees an active session (cookie) and does not prompt for credentials again. It immediately issues a JWT for BlackRoadInc and redirects back. This all could happen within seconds, possibly with a loading spinner shown on BlackRoadInc.us.

Access Granted – BlackRoadInc.us now receives the JWT for the user. It stores it (in memory or localStorage) and establishes the session. The user sees their RoadChain Wallet Dashboard as the landing page (balance, recent transactions, etc.). The portal front-end calls the /api/wallet endpoint (with JWT) to fetch real-time data: the Node backend verifies the token, then maybe queries the blockchain node or database for the user’s wallet info. The UI is populated with their RoadCoin balance and market data.

User Actions – The user can navigate the investor portal:

Wallet: They initiate a send of RoadCoins. The front-end opens a form, user inputs address and amount, the back-end API (with auth) processes it by creating a blockchain transaction (using the user’s private key or a custodial service). The transaction is sent to RoadChain network, and the UI updates the history (possibly after confirmation).

Transactions: They check the history page, which fetches a list of transactions (either from our database if we log them, or directly from chain using an API).

Stake: They go to the staking page. The portal calls an API to get current staking options/rates (maybe from a smart contract). The user chooses to stake some amount. The front-end triggers a stake transaction via API, similar to sending coins.

Investor Relations: The user visits an investor info section (could show project funding info, compliance docs, etc.). This might just be static content or fetched from a database. If there are interactive parts (like forms to download reports or sign agreements), those are handled by the BlackRoadInc backend (ensuring the user has permission).

Admin (if RIA officer): If the user is an RIA or admin, they might have access to special dashboards. The JWT might include a role claim that the backend checks to serve admin data.

Cross-Navigation: Suppose while on BlackRoadInc, the user decides to go back to the creative side (maybe a link “Go to AI Studio”). Since they are already logged in on both, going back to BlackRoad.io should not prompt login. BlackRoad.io would find its stored token still valid. If it expired, it could do a silent refresh via SSO as well. The user experiences a unified, logged-in state on both portals.

Logout: If the user logs out on the investor portal, similarly it will log out of SSO and then redirect the user (perhaps to a logged-out landing page on BlackRoadInc or back to BlackRoad.io homepage as a guest). Both tokens are invalidated. (If they return to the other site, it will see no valid token and require login again.)

Throughout these flows, the Lucidia SSO ensures that a user maintains one identity and one session across the ecosystem. The user can fluidly move from creating content with the AI on BlackRoad.io to managing their coins and investments on BlackRoadInc.us. The integration points (like redirecting to login, or clicking a cross-link) are carefully handled to carry over the session. Both portals have consistent navigation elements to allow the user to switch contexts (for example, BlackRoad.io might have a “Wallet” icon that brings you to BlackRoadInc, and BlackRoadInc might have a “AI Hub” icon linking back).

Deployment Checklist (Summary)

Development Setup: Ensure both projects (BlackRoad.io and BlackRoadInc) are cloned from repo. Install dependencies (npm install or similar). Set up environment variables for each (API keys, DB connection, JWT secret, etc., typically in .env files not committed to repo).

Build & Test: Run tests and build the production bundles. For Next.js, npm run build to compile. Verify that npm start (or next start) runs the app on the configured ports (8000/9000). Test locally that logging in flows work (you may simulate with appropriate config pointing to a dev SSO).

Server Provisioning: Set up the production server (Ubuntu 20.04 for instance). Install Node.js (latest LTS), Python (if needed), Docker (if using containers), and NGINX. Set up DNS A records for both domains to point to this server’s IP.

NGINX Config: Upload the NGINX config (as shown above) to /etc/nginx/sites-available/blackroad and symlink to sites-enabled. Obtain SSL certificates using Certbot for blackroad.io and blackroadinc.us (e.g., using the certbot --nginx plugin or separately). Ensure the certificate paths in the config are correct. Test NGINX config (nginx -t) and reload NGINX (systemctl reload nginx).

Database Setup: Install and configure the chosen database (e.g., PostgreSQL). Create the necessary databases/tables for users, posts, etc. Apply migrations or initial scripts to set up schema. Also set up Redis if used for caching.

Start Back-end Services: If there are any supporting services (e.g., a blockchain node or a Python AI service), start those first. For a blockchain node, run it and ensure it’s syncing or ready, and you have the RPC endpoint configured. For any AI service, ensure it’s up and accessible.

PM2 Deployment: On the server, in each project directory, run pm2 start commands to start the Node apps (as mentioned in Integration section). Alternatively, if using Docker, run docker-compose up -d with a compose file that sets up everything. Either way, ensure BlackRoadInc.us app listens on 8000 and BlackRoad.io on 9000. Use pm2 save and pm2 startup to make it persistent on reboots.

Verification: Access http://blackroad.io and http://blackroadinc.us to check that NGINX forwards to HTTPS. Then test https://blackroad.io – you should see the site, attempt a login, verify it goes to SSO, etc. Test https://blackroadinc.us similarly. Try basic functionalities (create a RoadBook post, it appears; send some RoadCoins on a test net, etc.). Monitor the server logs (PM2 logs and NGINX logs) for any errors.

Optimizations: Enable any production optimizations – e.g., in Next.js, ensure we run in NODE_ENV=production. Possibly configure caching headers in NGINX for static assets (Next.js static files in .next/static can be served with long cache times). Also, set up a firewall (allow 80/443, deny others).

Monitoring & Backups: Set up monitoring pings (so we know if either app goes down). Schedule database backups periodically. Also, set up Cron job for certbot renew to keep SSL fresh.

By following this checklist, we ensure that the BlackRoad ecosystem is deployed in a secure, scalable, and maintainable manner. The architecture’s two-portal design is fully realized with these steps – delivering a seamless user experience from AI creation to blockchain investment.
