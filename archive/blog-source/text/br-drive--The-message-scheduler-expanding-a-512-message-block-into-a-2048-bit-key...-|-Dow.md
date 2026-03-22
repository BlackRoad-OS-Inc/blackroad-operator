# The message scheduler expanding a 512 message block into a 2048-bit key... | Dow

**Source:** br-drive

---

## Page 1

g 10 -
loaded
colas
ourtois
ontent
ay be
bject to
pyright.
The message scheduler expanding a 512
message block into a 2048-bit key for the SHA-
256 block cipher. 
Download
View publication
For0≤t≤15,
W+=Mt
For16≤t≤63,
W+=01(Wt-z)EW+-7#0o(Wt15)#Wt-1
Source publication
Recruit researchers
Join for free
Login
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 1 of 23

## Page 2

ontexts in source publication
Context 1
... is 256 bits, the key size is 512 bits which is
expanded to 64 subkeys on 32 bits each for
each of 64 rounds of the cipher. The first 16
subkeys for the first 16 rounds are identical to
the message and are copied in the same order
cf. [30] and later Fig. 10. In addition in order to
hash a full message, SHA-256 applies a Merkle-
Damgard padding and length extension which
makes it a secure hash function for messages
of variable length. In the pre-processing stage,
we must append one binary 1 and many zeros
to the message in such a way that the resulting
length is equal to 448 modulo 512, cf. [30]. Then
we append the length of the message in bits as
a 64-bit big-endian integer. An interesting
peculiarity in Bitcoin specification and source
code is that hashing with full SHA-256 is applied
twice. This may seem as excessive: one
“secure” hash function should be sufficient. It
also makes our job of optimizing bitcoin mining
The Unreasonable Fundamental
Incertitudes Behind Bitcoin Mining
Article
Full-text available
Oct 2013
Nicolas Courtois · 
Marek Grajek · 
Rahul Naik
Bitcoin is a "crypto currency", a
decentralized electronic payment scheme
based on cryptography which has recently
gained excessive popularity. Scientific
research on bitcoin is less abundant. A
paper at Financial Cryptography 2012
conference explains that it is a system
which "uses no fancy cryptography", and is
"by no means perfect". It depends o...
+4
Cite
Download full-text
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 2 of 23

## Page 3

substantially more difficult. In the first
application of SHA-256 in Bitcoin mining the
message has a fixed length of 640 bits which
requires two applications of the compression
function as shown on Fig. 4. In the second
application SHA-256 is applied to 256 bits.
Overall “in theory” we need three applications of
the compression function as already shown on
Fig. 2 which we also show on a smaller-scale
Fig. 5 below for convenience. It may therefore
seem that a bitcoin miner needs to compute the
compression function 3.0 times for each nonce
and for each Merkle hash. In the following
sections we are going to work on reducing this
figure down to about 1.86 on average. Further
details about inner mechanisms of SHA-256 will
be provided later when we need them cf. for
example Section 11.4. We recall from Section
6.2 that new bitcoins can be created when the
miner succeeds to hash some data from the
bitcoin network together with a 32-bit random
nonce and is able to obtain a number on 256
bits which starts with a certain number of 60 or
more zeros. We call it C onstrained I nput S mall
O utput problem or shortly the CISO problem.
On Fig. 5 we recall the key steps in this
process. The process needs to be iterated with
different values of MerkleRoot and different 32-
bit nonces until a suitable “CISO configuration”
is found in which the output satisfies H 2 <
target as explained in Section 6.4. We can
reduce the cost factor from 3.0 to 2.0 almost
instantly by making the following observation. In
the process of bitcoin mining the first
compression function does not depend on the
random nonce on 32 bits. Therefore we can
compute it once every 2 32 nonces. On average
we need 1 2 . 0 + 2 32 compression functions.
The added factor is the amortized cost of the
first hash and can be neglected. Important
Remark. In more advanced bitcoin mining
algorithms the miner does not have to compute
the output for every nonce. He can do it only for
some well chosen nonces. They may be chosen
in such a way as in order to obtain specific
values which make the computation easier.
Moreover, some well chosen nonces could be
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 3 of 23

## Page 4

generated in some specific order in order to
enable incremental computations. In an
incremental computation some computations
could made easier by reusing all the (known)
internal values in one or several previous
computations. There is a lot of highly non-trivial
optimizations which can be developed. One
simple example of incremental computation will
be given in Section 11.4, another in Section
11.9. We look at the computation of H2 on Fig.
5, (the second computation of the hash function
and the third compression function). A close
examination reveals that in last rounds of the
underlying block cipher the two words on 32 bits
in which we we want to have at least 60 zeros,
after addition of a suitable constant, are created
at rounds 60 and 61 if we number from 0. We
basically want to force values created at rounds
t = 60 and 61 to two fixed constants which come
from the SHA-256 IV constants, and which
would produce zeros at the output. For this most
of the time we just need to compute the first 61
rounds out of 64 and we can early reject most
cases. Only in 1 / 2 32 of cases we need to
compute 62 rounds in the third compression
function. Then only in some 1 / 2 60 of cases
where we have actually obtained at least 60
zeros, we would need compute the full 64
rounds. Thus overall one only needs to compute
the whole compression function an equivalent of
very roughly 1 + 61 / 64 ≈ 1 . 95 times on
average. Most of the time one only needs to
compute H 1 and 61 rounds of H 2 to early
reject the 32-bit value obtained which must be
equal to the IV constant. Remark 1. This figure
is not exact and in fact it is slightly less. This is
because we can in fact save a higher fraction of
about 3/48 of the message expansion process
when we stop our computation at 61 rounds.
This is due to the fact that message expansion
is only computed in the last 48 rounds, in the
first 16 rounds the message is copied cf. [30]
and later Fig. 10. For the sake of simplicity we
ignore the message expansion in our
calculations. Remark 2. We have carefully
checked the ordering of words by inspection of
bitcoin source code [6] and by computer
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 4 of 23

## Page 5

experiments. An interesting question is what
would happen if the bitcoin designers have
formatted the output of the hash function in the
reversed order. If they required that 60 bits are
at 0 at the opposite end compared to the current
formatting, then it is possible to see that the
miner would need to do more work: 63 out of 64
rounds in the last application of the compression
function. This would make mining more
expensive and would cancel most of our
savings. Now we look at the second
computation of the hash function in the second
compression function, the computation of H1 on
Fig. 5. Here we use the observation that in
SHA-256 the key for the first 16 rounds are
exactly the 16 message blocks in the same
order, cf. [30] and Fig. 10. It is possible that in
the second compression function on Fig. 5 the
nonce enters at round 3 (numbered from 0) and
therefore in most cases we just need to
compute the last 61 out of 64 rounds of the
block cipher. The first three rounds are the
same for every nonce and their (amortized) cost
is nearly zero. Putting together Improvement 2
and Improvement 3, overall one only needs to
compute the whole compression function
slightly less than an equivalent of 2 × 61 / 64 = 1
. 90 times. This improvement requires us to
delve more deeply into the structure of the block
cipher inside SHA-256. We recall that the state
of the cipher after round 2 is constant and does
not yet depend on the value od the nonce. The
32-bit nonce will be precisely copied to become
the session key for the round 3 of encryption.
On Fig. 7 we show the circuit for one round of
encryption where at round 3 the nonce enters
as W 3 = nonce as shown on later Fig. 9. Here
denotes one addition on 32 bits. Here W t is the
key derived from the message and K t is a
certain constant [30]. For t = 3 we have W 3 =
nonce . Now it is obvious that the whole round 3
can be computed essentially for free in the
incremental way. We just need two 32-bit
increments instead of one whole round which is
about 7 additions and 4 other 32-bit operations.
Each time we increment the nonce we simply
need to increment two values at the output of
Join ResearchGate to find the people and
research you need to help your work
25+ million members
160+ million publication pages
2.3+ billion citations
Join for free
We and our partners use cookies
✕
By using this site, you consent to the processing of your
personal data, the storing of cookies on your device, and the
use of similar technologies for personalization, ads, analytics,
etc. For more information or to opt out, see our Privacy Policy
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 5 of 23

## Page 6

round 3 which is shown on Fig. 8 ...
Context 2
... more difficult. In the first application of SHA-
256 in Bitcoin mining the message has a fixed
length of 640 bits which requires two
applications of the compression function as
shown on Fig. 4. In the second application SHA-
256 is applied to 256 bits. Overall “in theory” we
need three applications of the compression
function as already shown on Fig. 2 which we
also show on a smaller-scale Fig. 5 below for
convenience. It may therefore seem that a
bitcoin miner needs to compute the
compression function 3.0 times for each nonce
and for each Merkle hash. In the following
sections we are going to work on reducing this
figure down to about 1.86 on average. Further
details about inner mechanisms of SHA-256 will
be provided later when we need them cf. for
example Section 11.4. We recall from Section
6.2 that new bitcoins can be created when the
miner succeeds to hash some data from the
bitcoin network together with a 32-bit random
nonce and is able to obtain a number on 256
bits which starts with a certain number of 60 or
more zeros. We call it C onstrained I nput S mall
O utput problem or shortly the CISO problem.
On Fig. 5 we recall the key steps in this
process. The process needs to be iterated with
different values of MerkleRoot and different 32-
bit nonces until a suitable “CISO configuration”
is found in which the output satisfies H 2 <
target as explained in Section 6.4. We can
reduce the cost factor from 3.0 to 2.0 almost
instantly by making the following observation. In
the process of bitcoin mining the first
compression function does not depend on the
random nonce on 32 bits. Therefore we can
compute it once every 2 32 nonces. On average
we need 1 2 . 0 + 2 32 compression functions.
The added factor is the amortized cost of the
first hash and can be neglected. Important
Remark. In more advanced bitcoin mining
algorithms the miner does not have to compute
the output for every nonce. He can do it only for
View in full-text
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 6 of 23

## Page 7

some well chosen nonces. They may be chosen
in such a way as in order to obtain specific
values which make the computation easier.
Moreover, some well chosen nonces could be
generated in some specific order in order to
enable incremental computations. In an
incremental computation some computations
could made easier by reusing all the (known)
internal values in one or several previous
computations. There is a lot of highly non-trivial
optimizations which can be developed. One
simple example of incremental computation will
be given in Section 11.4, another in Section
11.9. We look at the computation of H2 on Fig.
5, (the second computation of the hash function
and the third compression function). A close
examination reveals that in last rounds of the
underlying block cipher the two words on 32 bits
in which we we want to have at least 60 zeros,
after addition of a suitable constant, are created
at rounds 60 and 61 if we number from 0. We
basically want to force values created at rounds
t = 60 and 61 to two fixed constants which come
from the SHA-256 IV constants, and which
would produce zeros at the output. For this most
of the time we just need to compute the first 61
rounds out of 64 and we can early reject most
cases. Only in 1 / 2 32 of cases we need to
compute 62 rounds in the third compression
function. Then only in some 1 / 2 60 of cases
where we have actually obtained at least 60
zeros, we would need compute the full 64
rounds. Thus overall one only needs to compute
the whole compression function an equivalent of
very roughly 1 + 61 / 64 ≈ 1 . 95 times on
average. Most of the time one only needs to
compute H 1 and 61 rounds of H 2 to early
reject the 32-bit value obtained which must be
equal to the IV constant. Remark 1. This figure
is not exact and in fact it is slightly less. This is
because we can in fact save a higher fraction of
about 3/48 of the message expansion process
when we stop our computation at 61 rounds.
This is due to the fact that message expansion
is only computed in the last 48 rounds, in the
first 16 rounds the message is copied cf. [30]
and later Fig. 10. For the sake of simplicity we
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 7 of 23

## Page 8

ignore the message expansion in our
calculations. Remark 2. We have carefully
checked the ordering of words by inspection of
bitcoin source code [6] and by computer
experiments. An interesting question is what
would happen if the bitcoin designers have
formatted the output of the hash function in the
reversed order. If they required that 60 bits are
at 0 at the opposite end compared to the current
formatting, then it is possible to see that the
miner would need to do more work: 63 out of 64
rounds in the last application of the compression
function. This would make mining more
expensive and would cancel most of our
savings. Now we look at the second
computation of the hash function in the second
compression function, the computation of H1 on
Fig. 5. Here we use the observation that in
SHA-256 the key for the first 16 rounds are
exactly the 16 message blocks in the same
order, cf. [30] and Fig. 10. It is possible that in
the second compression function on Fig. 5 the
nonce enters at round 3 (numbered from 0) and
therefore in most cases we just need to
compute the last 61 out of 64 rounds of the
block cipher. The first three rounds are the
same for every nonce and their (amortized) cost
is nearly zero. Putting together Improvement 2
and Improvement 3, overall one only needs to
compute the whole compression function
slightly less than an equivalent of 2 × 61 / 64 = 1
. 90 times. This improvement requires us to
delve more deeply into the structure of the block
cipher inside SHA-256. We recall that the state
of the cipher after round 2 is constant and does
not yet depend on the value od the nonce. The
32-bit nonce will be precisely copied to become
the session key for the round 3 of encryption.
On Fig. 7 we show the circuit for one round of
encryption where at round 3 the nonce enters
as W 3 = nonce as shown on later Fig. 9. Here
denotes one addition on 32 bits. Here W t is the
key derived from the message and K t is a
certain constant [30]. For t = 3 we have W 3 =
nonce . Now it is obvious that the whole round 3
can be computed essentially for free in the
incremental way. We just need two 32-bit
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 8 of 23

## Page 9

increments instead of one whole round which is
about 7 additions and 4 other 32-bit operations.
Each time we increment the nonce we simply
need to increment two values at the output of
round 3 which is shown on Fig. 8 ...
Context 3
... generation - hardware mining with ASICs .
Finally since mid- 2013 miners are moving
towards using ASICs, dedicated hashing chips.
This further decreases the cost of mining and in
particular power consumption many times.
These devices can achieve as little as 0.35 W
per Gh/s (pre-order announcement from
Bitmine.ch expected to ship in November 2013).
As we can see, the energy efficiency of bitcoin
miners have improved by a factor of nearly
10,000 since 2009. Recent developments have
driven amateurs out of business and require
them to invest thousands of dollars and
purchase specialized hardware. At the same tile
new innovative business ventures make money
by selling increasingly sophisticated bitcoin
mining devices. At the moment of writing the
key players in this business are the US
company Butterfly Labs, Swedish KNC miner,
the Swiss company Bitmine.ch, their Russian
competitor BitFury and few other. There is
abundant publicly available data about bitcoin
mining. In April 2013 it was estimated that
bitcoin miners already used about 982
Megawatt hours every day, enough to power
about 30,000 U.S. homes or an equivalent of
150,000 USD per day in electricity bills. Still
they would be able to make some 0.7 Millions of
dollars in daily profits [34]. At that time the hash
rate was about 60 Tera Hashes/s. At the
moment of writing (22 October 2013) the hash
rate has attained 3000 Tera Hashes/s due to a
massive switch from GPU and FPGA mining to
ASIC mining. However the power consumption
have probably decreased due to the fact that
recent mining devices are more efficient, see
Section 12. Bitcoin mining is known to be a
highly profitable business. Some online tools for
bitcoin profitability calculations based on the
View in full-text
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 9 of 23

## Page 10

price of electricity are available, cf. [1]. We
contend that there will be further improvements
in the basic technology. In science, not
everything can be improved. Interestingly in
business, we are accus- tomed to see that more
or less every technology which has some
economic impact can be systematically
improved every year. This is for example is
reflected in the famous Moore’s law. We see no
reason why it should be otherwise with basic
algorithmic technology behind bitcoin mining,
this independently from the question of efficient
hardware implementation of this technology.
Such improvements are inevitable. In the long
run, we believe that sooner or later there will be
substantially better technology for bitcoin
mining, would this be with quantum computers
or a fundamentally different methodology than
currently known. In order to fix the ideas we call
this claim a super optimistic assumption . The
interesting aspect is that researchers who are
able to generate such improvements will be able
to make a lot of money by mining bitcoins and
selling them at their market price, or by licencing
their algorithmic improvements to miners.
Moreover even a tiny energy efficiency
improvement of 1 % could be profitable as it will
generate already thousands of dollars of
tangible savings on electricity bills. In this paper
we show that such improvements are possible,
see Section 12. However we have do not claim
that we are getting anywhere near the fifth
generation of bitcoin miners. We have been only
moderately successful in this task and therefore
our result are like generation 4.1. of bitcoin
miners, a small improvement. We offer our
improvements free of charge and do not plan to
patent them. In this section we re-visit and
expand our technical explanation of the
internals behind bitcoin mining fom Section 6.3.
We recall that we can see the problem of bitcoin
mining as a specific problem in symmetric
cryptography which we called “CISO hash
puzzle”. It involves three applications of a block
cipher. We have already outlined this approach
on Fig. 2 and now we explain it in all due
details. Our analysis follows the NIST
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 10 of 23

## Page 11

specification of SHA-256 [30] and the inspection
of the Bitcoin source code [6]. We use vere
similar notations and graphical conventions as
the leading experts of SHA-256 in the
cryptographic literature, see for example [35,
40]. We start by recalling how the SHA-256 has
function is constructed and then we show how
exactly it is used in bitcoin mining. SHA-256 is a
hash function built from a block cipher following
the well-known Davies-Meyer construction in
which the input is at the end added to the
output. This construction is one of the known
methods to transform a block cipher into a
compression function. A compression function is
a building block of a hash function with a fixed
input size. It is typically equal to twice the output
size. In our case we have a compression
function from 512 to 256 bits, cf. Fig. 3. The
block size in this block cipher is 256 bits, the
key size is 512 bits which is expanded to 64
subkeys on 32 bits each for each of 64 rounds
of the cipher. The first 16 subkeys for the first 16
rounds are identical to the message and are
copied in the same order cf. [30] and later Fig.
10. In addition in order to hash a full message,
SHA-256 applies a Merkle- Damgard padding
and length extension which makes it a secure
hash function for messages of variable length.
In the pre-processing stage, we must append
one binary 1 and many zeros to the message in
such a way that the resulting length is equal to
448 modulo 512, cf. [30]. Then we append the
length of the message in bits as a 64-bit big-
endian integer. An interesting peculiarity in
Bitcoin specification and source code is that
hashing with full SHA-256 is applied twice. This
may seem as excessive: one “secure” hash
function should be sufficient. It also makes our
job of optimizing bitcoin mining substantially
more difficult. In the first application of SHA-256
in Bitcoin mining the message has a fixed length
of 640 bits which requires two applications of
the compression function as shown on Fig. 4. In
the second application SHA-256 is applied to
256 bits. Overall “in theory” we need three
applications of the compression function as
already shown on Fig. 2 which we also show on
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 11 of 23

## Page 12

a smaller-scale Fig. 5 below for convenience. It
may therefore seem that a bitcoin miner needs
to compute the compression function 3.0 times
for each nonce and for each Merkle hash. In the
following sections we are going to work on
reducing this figure down to about 1.86 on
average. Further details about inner
mechanisms of SHA-256 will be provided later
when we need them cf. for example Section
11.4. We recall from Section 6.2 that new
bitcoins can be created when the miner
succeeds to hash some data from the bitcoin
network together with a 32-bit random nonce
and is able to obtain a number on 256 bits
which starts with a certain number of 60 or more
zeros. We call it C onstrained I nput S mall O
utput problem or shortly the CISO problem. On
Fig. 5 we recall the key steps in this process.
The process needs to be iterated with different
values of MerkleRoot and different 32-bit
nonces until a suitable “CISO configuration” is
found in which the output satisfies H 2 < target
as explained in Section 6.4. We can reduce the
cost factor from 3.0 to 2.0 almost instantly by
making the following observation. In the process
of bitcoin mining the first compression function
does not depend on the random nonce on 32
bits. Therefore we can compute it once every 2
32 nonces. On average we need 1 2 . 0 + 2 32
compression functions. The added factor is the
amortized cost of the first hash and can be
neglected. Important Remark. In more
advanced bitcoin mining algorithms the miner
does not have to compute the output for every
nonce. He can do it only for some well chosen
nonces. They may be chosen in such a way as
in order to obtain specific values which make
the computation easier. Moreover, some well
chosen nonces could be generated in some
specific order in order to enable incremental
computations. In an incremental computation
some computations could made easier by
reusing all the (known) internal values in one or
several previous computations. There is a lot of
highly non-trivial optimizations which can be
developed. One simple example of incremental
computation will be given in Section 11.4,
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 12 of 23

## Page 13

another in Section 11.9. We look at the
computation of H2 on Fig. 5, (the second
computation of the hash function and the third
compression function). A close examination
reveals that in last rounds of the underlying
block cipher the two words on 32 bits in which
we we want to have at least 60 zeros, after
addition of a suitable constant, are created at
rounds 60 and 61 if we number from 0. We
basically want to force values created at rounds
t = 60 and 61 to two fixed constants which come
from the SHA-256 IV constants, and which
would produce zeros at the output. For this most
of the time we just need to compute the first 61
rounds out of 64 and we can early reject most
cases. Only in 1 / 2 32 of cases we need to
compute 62 rounds in the third compression
function. Then only in some 1 / 2 60 of cases
where we have actually obtained at least 60
zeros, we would need compute the full 64
rounds. Thus overall one only needs to compute
the whole compression function an equivalent of
very roughly 1 + 61 / 64 ≈ 1 . 95 times on
average. Most of the time one only needs to
compute H 1 and 61 rounds of H 2 to early
reject the 32-bit value obtained which must be
equal to the IV constant. Remark 1. This figure
is not exact and in fact it is slightly less. This is
because we can in fact save a higher fraction of
about 3/48 of the message expansion process
when we stop our computation at 61 rounds.
This is due to the fact that message expansion
is only computed in the last 48 rounds, in the
first 16 rounds the message is copied cf. [30]
and later Fig. 10. For the sake of simplicity we
ignore the message expansion in our
calculations. Remark 2. We have carefully
checked the ordering of words by inspection of
bitcoin source code [6] and by computer
experiments. An interesting question is what ...
Context 4
... next improvement comes from the fact that
the key in the first 16 rounds of the block cipher
is an exact copy of the message. Many parts of
this key are constants. Many are actually always
View in full-text
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 13 of 23

## Page 14

equal to zero. This allows one to save a lot of
additions in the computation of SHA-256.
Overall we see that we can save 18 additions:
16 additions have a constant equal equal to
zero, and 2 more additions with 0x80000000
which can be replaced by flipping one bit, the
cost of which is very small (in hardware) when
compared to the cost of one addition. It is easy
to see that 2 more additions can be saved.
Looking at Fig 9 we should not count the three
first constants on the left in yellow which are
identical for all the 2 32 different nonces. This is
because this saving was already done in
Section 11.3. However we have two additional
constants in the last line in green. Then in these
two last rounds, one in each computation, we
can pre-compute the constants K t W t on 32
bits which saves us 2 additions such as in the
upper right corner of Fig. 7. Before we can
propose additional optimizations, we need to
explain how the message expansion works in
the NIST specification of SHA-256 [30]. We
refer to [30] for definitions of σ and σ . We
consider the computation of H1. It is possible to
see that the first two non- trivial keys W 16 and
W 17 are also constants and do not yet depend
on the nonce. This is because following Fig. 10
we ...
tations
View in full-text
... The results of research work
by Curtois et al. (Courtois et al.
2013 ) about the rewardhalving
scheme in Bitcoin, consider that
the current Bitcoin specification
mandates a strong 4-year cyclic
property, and they find this
property totally unreasonable and
harmful and explain why and how
it needs to be changed. ...
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 14 of 23

## Page 15

An Empirical Examination of
Bitcoin’s Halving Effects: Assessin…
Article
Full-text available
May 2024
Juraj Fabus · 
Iveta Kremenova ·
Natalia Stalmasekova · 
Terezia
Kvasnicova-Galovicova
This article explores the significance of
Bitcoin halving events within the
cryptocurrency ecosystem and their…
View
... Every block has a block
header. A block's header has a
size of 80 bytes (Antonopoulos,
2014) and, as explained by
Courtois et al. (2014) , contains
the following information: The
version number of the protocol
(with a size of 4 bytes); the hash
of the previous block's header
(with a size of 32 bytes); the
Merkle root (with a size of 32
bytes); the timestamp (with a size
of 4 bytes); the target (with a size
of 4 bytes); the padding + len
(with a size of 4 bytes); and the
nonce (with a size of 4 bytes).
Miners fix all the components of
the block, and for that particular
block try different nonces. ...
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 15 of 23

## Page 16

A Note on the Non-proportionality of
Winning Probabilities in Bitcoin
Article
Full-text available
Oct 2023 · Comput Econ
José Parra-Moyano · 
Gregor
Reich · 
Karl Schmedders
The security of any proof-of-work
blockchain protocol is based upon the
assumption that the probability of a…
Three essays on the management
and economics of blockchain-base…
Article
Sep 2019
José Parrra Moyano
View
... Blocks have a size limit set to
1 MB 2 . As explained by
Courtois, Grajek, and Naik
(2014b) , blocks contain the
following information: ...
... There are methods to speed
up this double-hashing
procedure. SeeHanke (2016)
and Courtois et al. (2014b) . ...
View
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 16 of 23

## Page 17

Urns Filled with Bitcoins: New
Perspectives on Proof-of-Work…
Preprint
Jun 2019
Jose Parra-Moyano · 
Gregor
Reich · 
Karl Schmedders
The probability of a miner finding a valid
block in the bitcoin blockchain is
assumed to follow the Poisson…
... Blocks have a size limit set to
1 MB 2 . As explained by
Courtois, Grajek, and Naik
(2014b) , blocks contain the
following information: ...
... There are methods to speed
up this double-hashing
procedure. SeeHanke (2016)
and Courtois et al. (2014b) . ...
View
... Blocks have a size limit set to
1 MB 2 . As explained by
Courtois, Grajek, and Naik
(2014b) , blocks contain the
following information: ...
... There are methods to speed
up this double-hashing
procedure. SeeHanke (2016)
and Courtois et al. (2014b) . ...
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 17 of 23

## Page 18

Doctoral Dissertation: Three Essays
on the Management and Economic…
Thesis
Full-text available
May 2019
Jose Parra-Moyano
This thesis compiles three papers on
different topics in blockchain-based
information systems. The first paper…
Bitcoin: Drivers and Impediments
Article
Full-text available
Aug 2017
Tatiana Ermakova · 
Benjamin
Fabian · 
Annika Baumann · Mykyta
Izmailov · 
Hanna Krasnova
The Bitcoin digital currency increasingly
attracts an essential number of Internet
users. This study focuses on the futur…
View
... The promise of multiple
benefits such as quick and cheap
transactions provided through the
Bitcoin cryptocurrency attracts
financial institutions and
individual merchants worldwide
(Mullan, 2014;Brito, 2013). Their
attraction can further be
motivated through higher
robustness against interference
compared to conventional
payment providers who may
prevent a transaction due to
political, security or other
reasons (Hill, 2013), ongoing
optimizations (Courtois et al.,
2013) , investment opportunities
(Donnelly, 2015), etc. ...
View
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 18 of 23

## Page 19

Banking on Blockchain: Costs
Savings Thanks to the Blockchain…
Article
Full-text available
Jun 2017
Luisanna Cocco · 
Andrea Pinna ·
Michele Marchesi
This paper looks at the challenges and
opportunities of implementing
blockchain technology across banking…
... Results similar to those by
Czarnek for the Bitcoin system
emerge also from other works,
such as that by [26], who
simulate an artificial Bitcoin
market, and that by [37] , who
wrote: ...
View
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 19 of 23

## Page 20

A Survey on Security and Privacy
Issues of Bitcoin
Article
Jun 2017
Mauro Conti · 
Sandeep Kumar
E · 
Chhagan Lal · 
Sushmita Ruj
Bitcoin is a popular "cryptocurrency"
that records all transactions in an
distributed append-only public ledger…
... Bitcoin counters the sybil
attacks by making use of PoW in
which to verify a transaction, the
miners has to perform some sort
of computational task to prove
that they are not virtual entities.
The PoW consists of a complex
cryptographic math puzzle [18] ,
and it imposes a high level of
computational cost on the
transaction verification process,
thus the verification will be
dependent on the computing
power of a miner, instead on the
number of (possibly virtual)
identities. The main idea is that it
is much harder to fake the
computing resources in the
Bitcoin network than it is to
perform a sybil attack. ...
View
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 20 of 23

## Page 21

Modeling and Simulation of the
Economics of Mining in the Bitcoin…
Preprint
May 2016
Luisanna Cocco · 
Michele
Marchesi
In January 3, 2009, Satoshi Nakamoto
gave rise to the "Bitcoin Block Chain"
creating the first block of the chain…
... As soon as new transactions
are notified to the network,
miners check their validity and
authenticity and collect them in a
block. Then, they take the
information contained in the
block of the transactions, which
include a variable number called
"nonce" and run the SHA-256
hashing algorithm on this block,
turning the initial information into
a sequence of 256 bits, known as
Hash [18] . ...
... In a nutshell, "Bitcoin miners
make money when they find a
32-bit value which, when hashed
together with the data from other
transactions with a standard
hash function gives a hash with a
certain number of 60 or more
zeros. This is an extremely rare
event", [18] . ...
View
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 21 of 23

## Page 22

Modeling and Simulation of the
Economics of Mining in the Bitcoin…
Article
Full-text available
May 2016 · PLOS ONE
Luisanna Cocco · 
Michele
Marchesi
In January 3, 2009, Satoshi Nakamoto
gave rise to the "Bitcoin Block Chain"
creating the first block of the chain…
... As soon as new transactions
are notified to the network,
miners check their validity and
authenticity and collect them in a
block. Then, they take the
information contained in the
block of the transactions, which
include a variable number called
"nonce" and run the SHA-256
hashing algorithm on this block,
turning the initial information into
a sequence of 256 bits, known as
Hash [18] . ...
... In a nutshell, "Bitcoin miners
make money when they find a
32-bit value which, when hashed
together with the data from other
transactions with a standard
hash function gives a hash with a
certain number of 60 or more
zeros. This is an extremely rare
event", [18] . ...
View
Show more
Get access to 30 million
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 22 of 23

## Page 23

figures
Join ResearchGate to access over 30 million
figures and 160+ million publications – all in one
place.
Join for free
Company
About us
News
Careers
Support
Help
Center
Business
solutions
Advertising
Recruiting
© 2008-2026 ResearchGate GmbH. All rights
reserved.
Terms · Privacy · Copyright · Imprint · Consent
preferences
https://www.researchgate.net/figure/The-message-scheduler-ex-block-into-a-2048-bit-key-for-the-SHA-256_fig9_258144528
1/19/26, 9:39 AM
Page 23 of 23
