/**
 * RoundTrip v5.0.0 — Enhanced Entry Point
 * Wraps the original worker with: rate limiting, caching, journey tracking,
 * 22 new endpoints, moral enforcement, and response enrichment.
 */
import originalWorker from './worker.js';
import { enhance } from './enhance.js';

export default enhance(originalWorker);
