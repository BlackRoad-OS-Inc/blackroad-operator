# The Complete Encyclopedia of File Systems

> Every file system ever created, organized by era. Research compiled for the BlackRoad Unified Path System.

---

## Table of Contents

1. [1960s - Mainframe & Timesharing Era](#1960s---mainframe--timesharing-era)
2. [1970s - Unix & Minicomputer Era](#1970s---unix--minicomputer-era)
3. [1980s - Personal Computer Era](#1980s---personal-computer-era)
4. [1990s - Network & Enterprise Era](#1990s---network--enterprise-era)
5. [2000s - Scale & Reliability Era](#2000s---scale--reliability-era)
6. [2010s - Cloud & Distributed Era](#2010s---cloud--distributed-era)
7. [2020s - AI, Edge & Content-Addressed Era](#2020s---ai-edge--content-addressed-era)
8. [Special Systems - Paradigm Breakers](#special-systems---paradigm-breakers)
9. [Network & Distributed Protocols](#network--distributed-protocols)
10. [Optical Media File Systems](#optical-media-file-systems)
11. [Addressing Schemes & Path Formats Summary](#addressing-schemes--path-formats-summary)
12. [Feature Matrix](#feature-matrix)

---

## 1960s - Mainframe & Timesharing Era

### CTSS File System (1961)

- **Year**: 1961
- **Creator**: MIT Computation Center (Fernando Corbato)
- **Key Innovation**: First general-purpose time-sharing file system; per-user directories with file sharing between users
- **Path Format**: `UFD:FILENAME` (Master File Directory / User File Directory two-level structure)
- **Max Path Length**: N/A (flat two-level hierarchy)
- **Max File Size**: Limited by disk capacity
- **Features**: Hierarchical dirs: No (two-level only) | Symlinks: No | Hard links: No | ACLs: Basic user permissions | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### DECtape File System (1963)

- **Year**: 1963
- **Creator**: Digital Equipment Corporation (DEC)
- **Key Innovation**: Block-oriented random-access tape that behaved like a slow disk; same format for tape and disk on RT-11
- **Path Format**: `DEV:FILENAME.EXT` (device-centric, e.g., `DTA0:FILE.DAT`)
- **Max Path Length**: 6+3 characters (6.3 filename format on PDP-8)
- **Max File Size**: ~276 KB per tape (184K 12-bit words)
- **Features**: Hierarchical dirs: No | Symlinks: No | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### OS/360 File System (1964)

- **Year**: 1964
- **Creator**: IBM
- **Key Innovation**: Volume Table of Contents (VTOC) on disk; dataset-oriented storage with record formats (RECFM); cataloged and uncataloged datasets
- **Path Format**: `DATASET.QUALIFIER.NAME` (dot-separated qualifiers, up to 44 chars, e.g., `SYS1.LINKLIB`)
- **Max Path Length**: 44 characters (dataset name)
- **Max File Size**: Volume-limited (multiple extents across tracks/cylinders)
- **Features**: Hierarchical dirs: No (flat catalog) | Symlinks: No (aliases) | Hard links: No | ACLs: RACF (added later) | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### Multics File System (1965)

- **Year**: 1965
- **Creator**: MIT/GE/Bell Labs (Corbato, Daley, Saltzer)
- **Key Innovation**: **FIRST hierarchical directory tree**; arbitrarily nested directories; segments as memory-mapped files; access control lists; symbolic links; long filenames; multiple names per file
- **Path Format**: `>root>directory>subdirectory>filename` (using `>` as separator)
- **Max Path Length**: Effectively unlimited (arbitrary depth)
- **Max File Size**: 256 KW (256K 36-bit words) per segment initially, later 1MW
- **Features**: Hierarchical dirs: **YES (FIRST)** | Symlinks: Yes | Hard links: Yes (multiple names) | ACLs: **YES (FIRST)** | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

---

## 1970s - Unix & Minicomputer Era

### Unix File System / UFS (1971-1973)

- **Year**: 1971 (PDP-7 Unix), 1973 (V6 UFS)
- **Creator**: Ken Thompson, Dennis Ritchie (Bell Labs)
- **Key Innovation**: Everything-is-a-file philosophy; inode-based metadata; simple byte-stream files; device files; hierarchical namespace inherited from Multics but with `/` separator; the pipe concept
- **Path Format**: `/directory/subdirectory/filename` (forward-slash separator)
- **Max Path Length**: 1024 bytes (PATH_MAX varies by implementation)
- **Max File Size**: Originally small (V6: ~1MB), grew with BSD FFS to 2GB+
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes (4.2BSD, 1983) | Hard links: Yes | ACLs: No (mode bits only, ACLs added later) | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### BSD Fast File System / FFS (1983)

- **Year**: 1983
- **Creator**: Marshall Kirk McKusick (UC Berkeley)
- **Key Innovation**: Cylinder groups for locality; configurable block sizes (4KB-8KB with fragments); improved free space management; ~10x performance improvement over original UFS
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 1024 bytes
- **Max File Size**: ~2 GB (32-bit addressing)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: No | Journaling: No | Snapshots: No (added in FFS2) | Dedup: No | Compression: No | Encryption: No | Distributed: No

### VSAM (1973)

- **Year**: 1973
- **Creator**: IBM
- **Key Innovation**: Virtual Storage Access Method; key-sequenced (KSDS), relative record (RRDS), entry-sequenced (ESDS), and linear (LDS) dataset organizations; control intervals and control areas for efficient I/O
- **Path Format**: `CATALOG.CLUSTER.NAME` (44-char dataset name)
- **Max Path Length**: 44 characters
- **Max File Size**: 4 GB (with extended format, up to 128 TB)
- **Features**: Hierarchical dirs: No | Symlinks: No | Hard links: No | ACLs: RACF | Journaling: No | Snapshots: No | Dedup: No | Compression: Yes (later) | Encryption: Yes (later) | Distributed: No

### CP/M File System (1974)

- **Year**: 1974
- **Creator**: Gary Kildall (Digital Research)
- **Key Innovation**: Simple disk allocation table; became the model for DOS; user numbers for file isolation
- **Path Format**: `A:FILENAME.EXT` (drive letter + 8.3 name)
- **Max Path Length**: ~15 characters (drive + 8.3)
- **Max File Size**: Limited by disk size (typically 8" floppy: ~243 KB)
- **Features**: Hierarchical dirs: No (flat + user numbers) | Symlinks: No | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

---

## 1980s - Personal Computer Era

### FAT12 (1980)

- **Year**: 1980
- **Creator**: Tim Paterson (Seattle Computer Products), later Microsoft
- **Key Innovation**: File Allocation Table with 12-bit cluster addresses; designed for floppy disks; became the universal interchange format
- **Path Format**: `A:\DIRECTORY\FILENAME.EXT` (drive letter, backslash separator, 8.3 names)
- **Max Path Length**: 66 characters (absolute path under MS-DOS)
- **Max File Size**: 16 MB (32 MB with larger clusters)
- **Features**: Hierarchical dirs: Yes (DOS 2.0+, 1983) | Symlinks: No | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### FAT16 (1984)

- **Year**: 1984
- **Creator**: Microsoft
- **Key Innovation**: 16-bit cluster addresses; supported hard disks up to 4 GB
- **Path Format**: `C:\DIRECTORY\FILENAME.EXT` (8.3 names, 66-char max path)
- **Max Path Length**: 66 characters (CDS limit), 260 with LFN
- **Max File Size**: 2 GB (4 GB with LFS)
- **Features**: Hierarchical dirs: Yes | Symlinks: No | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### HFS - Hierarchical File System (1985)

- **Year**: 1985 (September)
- **Creator**: Apple Computer
- **Key Innovation**: B-tree catalog file for fast lookups; resource forks + data forks (dual-fork architecture); designed for Apple's first hard disk
- **Path Format**: `Volume:Folder:Subfolder:Filename` (colon separator)
- **Max Path Length**: 31 characters per filename component
- **Max File Size**: 2 GB
- **Features**: Hierarchical dirs: Yes | Symlinks: No (aliases later) | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### Minix File System (1987)

- **Year**: 1987
- **Creator**: Andrew S. Tanenbaum
- **Key Innovation**: Clean, simple Unix-like filesystem for teaching; directly inspired Linus Torvalds to create Linux and ext; proved that a simple, clear FS implementation could be understood by students
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 14-character filenames (30 in later versions)
- **Max File Size**: 64 MB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: No (Unix mode bits) | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### Amiga Fast File System / AFFS (1988)

- **Year**: 1988
- **Creator**: Commodore (AmigaOS 1.3)
- **Key Innovation**: Removed OFS redundancy overhead; data blocks contain only data (no metadata per block); bitmap validation for crash safety; supported autobooting from hard disk
- **Path Format**: `Volume:Directory/Subdirectory/Filename` (colon for device, slash for directories)
- **Max Path Length**: 30 characters per filename, 255 for full path
- **Max File Size**: 4 GB (32-bit addressing; 64-bit patches later)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes (soft links) | Hard links: Yes | ACLs: No (protection bits) | Journaling: No (bitmap validation) | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### HPFS - High Performance File System (1989)

- **Year**: 1989
- **Creator**: IBM/Microsoft (for OS/2)
- **Key Innovation**: B+ tree directories; long filenames (254 chars); reduced fragmentation; extended attributes; no 8.3 restriction
- **Path Format**: `C:\Directory\LongFileName.Extension`
- **Max Path Length**: 254 characters
- **Max File Size**: 2 GB
- **Features**: Hierarchical dirs: Yes | Symlinks: No | Hard links: No | ACLs: Yes (OS/2) | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### VxFS - Veritas File System (1989)

- **Year**: 1989
- **Creator**: Veritas Software (now Symantec/Broadcom)
- **Key Innovation**: First commercial journaling file system; extent-based allocation; online resizing
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 1024 bytes
- **Max File Size**: 256 TB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: **YES (FIRST commercial)** | Snapshots: Yes | Dedup: No | Compression: No | Encryption: No | Distributed: No

---

## 1990s - Network & Enterprise Era

### ext (Extended File System) (1992)

- **Year**: 1992 (April)
- **Creator**: Remy Card
- **Key Innovation**: First filesystem specifically for Linux; replaced Minix FS limitations
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 2 GB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### ext2 (1993)

- **Year**: 1993 (January)
- **Creator**: Remy Card
- **Key Innovation**: First commercial-grade Linux filesystem; block groups for locality; configurable block sizes; extended attributes; pre-allocation
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames, no fixed path limit
- **Max File Size**: 16 GB - 2 TB (depending on block size)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes (with patches) | Journaling: No | Snapshots: No | Dedup: No | Compression: No (e2compr patch) | Encryption: No | Distributed: No

### NTFS (1993)

- **Year**: 1993 (July, with Windows NT 3.1)
- **Creator**: Microsoft (Tom Miller, Gary Kimura)
- **Key Innovation**: Master File Table (MFT) with everything as metadata; journaling ($LogFile); per-file ACLs; Alternate Data Streams; sparse files; compression; EFS encryption; reparse points (symlinks, junctions, mount points); quota tracking; change journal
- **Path Format**: `C:\Directory\Filename` or `\\?\C:\Very\Long\Path` (UNC: `\\server\share\path`)
- **Max Path Length**: 255 chars (filename), 32,767 chars (path with \\?\ prefix), 260 chars (Win32 API legacy)
- **Max File Size**: 16 TB (4KB clusters), up to 8 PB (theoretically 16 EB)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes (reparse points) | Hard links: Yes | ACLs: **Yes (full DACL/SACL)** | Journaling: Yes | Snapshots: Yes (VSS) | Dedup: Yes (Server 2012+) | Compression: Yes (LZNT1) | Encryption: Yes (EFS) | Distributed: No (but SMB/DFS)

### WAFL - Write Anywhere File Layout (1994)

- **Year**: 1994
- **Creator**: NetApp (Dave Hitz, James Lau, Michael Malcolm)
- **Key Innovation**: All data and metadata can be written anywhere on disk (no fixed locations); instant snapshots via root inode copy; consistency points; designed specifically as an NFS file server appliance filesystem
- **Path Format**: `/vol/volume_name/path` (NetApp NFS export)
- **Max Path Length**: Standard POSIX
- **Max File Size**: 16 TB+
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (NVRAM log) | Snapshots: **Yes (instant, space-efficient)** | Dedup: Yes | Compression: Yes | Encryption: Yes | Distributed: No (but clustered ONTAP)

### XFS (1994)

- **Year**: 1994 (SGI IRIX), 2001 (Linux port)
- **Creator**: Silicon Graphics (SGI)
- **Key Innovation**: 64-bit filesystem from inception; B+ tree everything (dirs, extents, free space); allocation groups for parallelism; real-time I/O guarantees; delayed allocation; online defragmentation
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 8 EB (64-bit)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (metadata) | Snapshots: No (native) | Dedup: No (native) | Compression: No | Encryption: No | Distributed: No

### FAT32 (1996)

- **Year**: 1996 (Windows 95 OSR2)
- **Creator**: Microsoft
- **Key Innovation**: 32-bit cluster addresses (28 actually used); broke the 2GB volume barrier of FAT16; long filename (LFN) support via VFAT
- **Path Format**: `C:\Directory\LongFileName.ext`
- **Max Path Length**: 260 characters (with LFN)
- **Max File Size**: 4 GB (4,294,967,295 bytes)
- **Features**: Hierarchical dirs: Yes | Symlinks: No | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### HFS+ / Mac OS Extended (1998)

- **Year**: 1998 (Mac OS 8.1)
- **Creator**: Apple Computer
- **Key Innovation**: 32-bit allocation blocks (vs 16-bit HFS); Unicode filenames (255 chars); journaling (added 10.2.2); case-preserving; hot file clustering; B-tree improvements
- **Path Format**: `/unix/style/path` (macOS) or `Volume:Folder:File` (classic Mac OS)
- **Max Path Length**: 255 characters per component, ~1024 total
- **Max File Size**: 8 EB (theoretical)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes (10.5+) | ACLs: Yes (10.4+) | Journaling: Yes (10.2.2+) | Snapshots: No | Dedup: No | Compression: Yes (10.6+ HFS+ Compression) | Encryption: Yes (FileVault, Core Storage) | Distributed: No

### JFS / JFS2 (1990/1999)

- **Year**: 1990 (AIX), 1999 (OS/2), 2001 (Linux)
- **Creator**: IBM
- **Key Innovation**: First journaling filesystem on AIX (1990); extent-based allocation; B+ tree directories; 64-bit in JFS2; lightweight journaling of metadata only
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 4 PB (JFS2 on AIX)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: **Yes (metadata)** | Snapshots: Yes (LVM) | Dedup: No | Compression: Yes (JFS1 on AIX) | Encryption: No | Distributed: No

### ReiserFS (1997/2001)

- **Year**: 1997 (development), 2001 (Linux 2.4.1 mainline)
- **Creator**: Hans Reiser / Namesys
- **Key Innovation**: Balanced tree (B\*-tree) for everything; tail packing (small files stored in tree nodes); exceptional small-file performance; efficient disk space usage
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 4032 bytes (filename), 3976 chars
- **Max File Size**: 1 EB (theoretical), 8 TB (page cache limited on 32-bit)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

---

## 2000s - Scale & Reliability Era

### ext3 (2001)

- **Year**: 2001 (Linux 2.4.15)
- **Creator**: Stephen Tweedie
- **Key Innovation**: Added journaling to ext2 with backward compatibility; three journaling modes (journal, ordered, writeback); online filesystem growth; HTree indexed directories
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 16 GB - 2 TB (block-size dependent)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (3 modes) | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### GFS / GFS2 - Global File System (1995/2004)

- **Year**: 1995 (original), 2004 (GFS2 in Linux 2.6.19)
- **Creator**: University of Minnesota (Matthew O'Keefe), then Red Hat/Sistina
- **Key Innovation**: Shared-disk cluster filesystem; all nodes have direct concurrent access to same block storage; distributed lock manager (DLM); no client/server roles (all peers)
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 100 TB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: **Yes (shared-disk cluster)**

### Lustre (2003)

- **Year**: 2003 (first production: LLNL MCR cluster)
- **Creator**: Peter Braam / Cluster File Systems Inc., later Sun, Oracle, Intel, Whamcloud
- **Key Innovation**: Parallel distributed filesystem for HPC; separate metadata and data servers; object-based storage; POSIX-compliant; scales to hundreds of PB and tens of TB/s aggregate throughput; powers most Top500 supercomputers
- **Path Format**: `/unix/style/path` (mounted via Lustre client)
- **Max Path Length**: Standard POSIX
- **Max File Size**: 31.25 PB per file (2^50 bytes with 1MB stripe)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (ldiskfs backend) | Snapshots: Yes (ZFS backend) | Dedup: No | Compression: No | Encryption: Yes (client-side, since 2.14) | Distributed: **Yes (parallel)**

### ZFS (2005)

- **Year**: 2005 (OpenSolaris), 2006 (Solaris 10 6/06)
- **Creator**: Sun Microsystems (Jeff Bonwick, Bill Moore, Matthew Ahrens)
- **Key Innovation**: **Combined filesystem + volume manager**; 128-bit addressing; copy-on-write; end-to-end checksums; self-healing (with mirrors/RAID-Z); instant snapshots and clones; native RAID (RAID-Z1/Z2/Z3); inline deduplication; transparent compression; send/receive replication; ARC (Adaptive Replacement Cache)
- **Path Format**: `/pool/dataset/path` (e.g., `/tank/data/documents/file.txt`)
- **Max Path Length**: 255-char filenames
- **Max File Size**: 16 EB (2^64 bytes)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes (NFSv4 ACLs) | Journaling: Yes (ZIL - intent log) | Snapshots: **Yes (instant, unlimited)** | Dedup: **Yes (inline)** | Compression: **Yes (lz4, gzip, zstd)** | Encryption: **Yes (AES-256-GCM, since OpenZFS 0.8)** | Distributed: No (single-host, but send/receive)

### OCFS2 - Oracle Cluster File System 2 (2006)

- **Year**: 2006 (mainline Linux kernel)
- **Creator**: Oracle
- **Key Innovation**: General-purpose clustered filesystem; distributed lock manager; reflinks (copy-on-write cloning); inline data for small files; metadata checksums
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 4 PB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes (POSIX) | Journaling: Yes | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: **Yes (shared-disk cluster)**

### exFAT (2006)

- **Year**: 2006 (Windows CE 6.0), 2019 (specs published, Linux support)
- **Creator**: Microsoft
- **Key Innovation**: Optimized for flash memory; 64-bit file size fields; no 4GB file limit of FAT32; free-space bitmap for fast allocation; adopted as standard for SDXC cards
- **Path Format**: `\Directory\Filename` (no drive letter inherent to FS)
- **Max Path Length**: 255-char filenames (Unicode)
- **Max File Size**: 16 EB (theoretical), 128 PB (volume limit)
- **Features**: Hierarchical dirs: Yes | Symlinks: No | Hard links: No | ACLs: No | Journaling: No (transaction-safe metadata via bitmap) | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### GlusterFS (2006)

- **Year**: 2006 (founded 2005, released 2006)
- **Creator**: Gluster Inc. (acquired by Red Hat 2011, now IBM)
- **Key Innovation**: Userspace distributed filesystem; no separate metadata server (metadata distributed with data); stackable translators architecture; elastic hashing for file placement; FUSE-based client
- **Path Format**: `/unix/style/path` (FUSE mount)
- **Max Path Length**: Standard POSIX
- **Max File Size**: Limited by brick filesystem (typically ext4/XFS limits)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (brick-level) | Snapshots: Yes (LVM) | Dedup: No | Compression: No | Encryption: Yes (TLS transport) | Distributed: **Yes (DHT-based)**

### ext4 (2008)

- **Year**: 2006 (announced), 2008 (Linux 2.6.28 stable)
- **Creator**: Theodore Ts'o and others
- **Key Innovation**: Extents (replacing indirect block mapping); multiblock allocation; delayed allocation; journal checksumming; 1 EB volume size; nanosecond timestamps; online defrag; backwards compatible with ext2/ext3
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 16 TB (4KB blocks)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes | Snapshots: No (native) | Dedup: No | Compression: No | Encryption: Yes (fscrypt, 4.1+) | Distributed: No

### Btrfs (2009)

- **Year**: 2007 (development), 2009 (Linux 2.6.29)
- **Creator**: Oracle (Chris Mason), later community
- **Key Innovation**: Copy-on-write B-tree filesystem; built-in volume management; subvolumes; writable snapshots; send/receive; transparent compression (lz4, zlib, zstd); checksums for data AND metadata; self-healing with RAID; online conversion from ext3/4; reflinks
- **Path Format**: `/unix/style/path` or `/@subvolume/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 16 EB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (CoW journal) | Snapshots: **Yes (writable!)** | Dedup: **Yes (offline + reflinks)** | Compression: **Yes (lzo, zlib, zstd)** | Encryption: No (planned) | Distributed: No

### HDFS - Hadoop Distributed File System (2006)

- **Year**: 2005 (development), 2006 (Apache Hadoop 0.1)
- **Creator**: Doug Cutting, Mike Cafarella (inspired by Google GFS paper)
- **Key Innovation**: Designed for commodity hardware; optimized for streaming large files; write-once-read-many; 64-128 MB block size; 3x replication; rack-aware placement; NameNode/DataNode architecture
- **Path Format**: `hdfs://namenode:port/path/to/file`
- **Max Path Length**: No hard limit (Java String)
- **Max File Size**: No hard limit (block-based, multi-TB files common)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: No | ACLs: Yes | Journaling: Yes (NameNode edit log) | Snapshots: Yes | Dedup: No | Compression: Yes (codec-based) | Encryption: Yes (transparent) | Distributed: **Yes (GFS-inspired)**

---

## 2010s - Cloud & Distributed Era

### F2FS - Flash-Friendly File System (2012)

- **Year**: 2012 (Linux 3.8)
- **Creator**: Samsung (Jaegeuk Kim)
- **Key Innovation**: Log-structured design optimized for NAND flash; Node Address Table (NAT) to avoid wandering tree problem; multi-head logging for hot/cold data separation; append-only writes; flash-aware garbage collection
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 3.94 TB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (roll-forward + roll-back) | Snapshots: No | Dedup: No | Compression: Yes (LZO, LZ4, zstd; since Linux 5.6) | Encryption: Yes (fscrypt) | Distributed: No

### CephFS (2012/2016)

- **Year**: 2006 (Ceph research), 2012 (initial CephFS), 2016 (stable in Jewel)
- **Creator**: Sage Weil (UC Santa Cruz), then Red Hat/IBM
- **Key Innovation**: POSIX-compliant distributed filesystem built on RADOS object store; dynamic metadata partitioning across MDS cluster; strong cache coherency; CRUSH algorithm for data placement (no lookup tables); scales to exabytes
- **Path Format**: `/unix/style/path` (kernel or FUSE mount)
- **Max Path Length**: Standard POSIX
- **Max File Size**: Limited only by pool capacity
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes (POSIX) | Journaling: Yes (MDS journal) | Snapshots: Yes | Dedup: No | Compression: Yes | Encryption: Yes (messenger v2) | Distributed: **Yes (CRUSH-based)**

### OverlayFS (2014)

- **Year**: 2010 (RFC), 2014 (Linux 3.18 mainline)
- **Creator**: Miklos Szeredi
- **Key Innovation**: Union filesystem for containers; transparent layering of upper (writable) over lower (read-only) directories; copy-on-write for modified files; up to 128 lower layers; became Docker's default storage driver
- **Path Format**: `/merged/view/of/path` (composite of lowerdir + upperdir)
- **Max Path Length**: Standard POSIX
- **Max File Size**: Underlying FS limits
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Underlying FS | Snapshots: Implicit (layers) | Dedup: Implicit (shared layers) | Compression: No | Encryption: No | Distributed: No

### APFS - Apple File System (2017)

- **Year**: 2016 (announced), 2017 (iOS 10.3, macOS 10.13)
- **Creator**: Apple (Dominic Giampaolo and team)
- **Key Innovation**: Copy-on-write; space sharing (multiple volumes share a container's free space); native encryption (per-file or per-volume, AES-XTS/AES-CBC); instant cloning; atomic safe-save; nanosecond timestamps; 64-bit inodes (9 quintillion files); crash protection via copy-on-write metadata; optimized for flash/SSD
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255 UTF-8 chars per component, 1024 total
- **Max File Size**: 8 EB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes (files) | ACLs: Yes | Journaling: No (CoW replaces journaling) | Snapshots: **Yes** | Dedup: No | Compression: No (native; HFS+ compression layer sometimes used) | Encryption: **Yes (native, multi-key)** | Distributed: No

### bcachefs (2015/2024)

- **Year**: 2015 (announced), 2024 (Linux 6.7 mainline), 2025 (removed from kernel, now external)
- **Creator**: Kent Overstreet
- **Key Innovation**: Evolved from bcache (SSD caching layer); aims to combine ZFS/Btrfs features in a GPL-compatible implementation; copy-on-write; checksums (CRC32C, 64-bit); encryption (ChaCha20/Poly1305); compression (LZ4, gzip, zstd); snapshots; erasure coding; tiered storage; 256KB B-tree nodes with log-structured internals
- **Path Format**: `/unix/style/path`
- **Max Path Length**: 255-char filenames
- **Max File Size**: 16 EB (theoretical)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (CoW + journal) | Snapshots: Yes | Dedup: No (planned) | Compression: **Yes (lz4, gzip, zstd)** | Encryption: **Yes (ChaCha20-Poly1305)** | Distributed: No (multi-device)

### IPFS - InterPlanetary File System (2015)

- **Year**: 2015
- **Creator**: Juan Benet / Protocol Labs
- **Key Innovation**: Content-addressed, peer-to-peer hypermedia protocol; Merkle DAG structure; Content Identifiers (CIDs) as addresses; data identified by hash not location; Kademlia DHT for peer discovery; IPLD (InterPlanetary Linked Data) for cross-protocol data structures; UnixFS for file/directory representation; immutable by default
- **Path Format**: `/ipfs/QmCID.../path/to/file` or `ipfs://CID/path` or `/ipns/name/path`
- **Max Path Length**: No inherent limit (CID-based)
- **Max File Size**: No inherent limit (chunked into 256KB blocks by default)
- **Features**: Hierarchical dirs: Yes (UnixFS) | Symlinks: Yes (UnixFS) | Hard links: No (content-addressed DAG) | ACLs: No (public by default) | Journaling: N/A (immutable) | Snapshots: Implicit (every version is permanent) | Dedup: **Yes (inherent - same content = same CID)** | Compression: No (application-layer) | Encryption: No (application-layer) | Distributed: **Yes (global P2P)**

### MooseFS (2008)

- **Year**: 2008 (open-sourced May 30)
- **Creator**: Gemius SA (Jakub Kruszona-Zawadzki)
- **Key Innovation**: POSIX-compliant distributed filesystem; fault-tolerant with configurable replication; FUSE-based client; near-perfect linear scaling; trash bin for deleted files; snapshot support
- **Path Format**: `/unix/style/path` (FUSE mount)
- **Max Path Length**: Standard POSIX
- **Max File Size**: 2^57 bytes (128 PB)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes (metadata) | Snapshots: Yes | Dedup: No | Compression: No | Encryption: No | Distributed: **Yes**

### LizardFS (2013)

- **Year**: 2013 (fork of MooseFS 1.6)
- **Creator**: Skytechnology (community-maintained)
- **Key Innovation**: Fork of MooseFS with erasure coding; improved metadata replication; QoS mechanisms
- **Path Format**: `/unix/style/path` (FUSE mount)
- **Max Path Length**: Standard POSIX
- **Max File Size**: 128 PB
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Yes | Snapshots: Yes | Dedup: No | Compression: No | Encryption: No | Distributed: **Yes**

### BeeGFS (2014)

- **Year**: 2014 (originally FhGFS from 2007)
- **Creator**: Fraunhofer Institute / ThinkParQ
- **Key Innovation**: Parallel cluster filesystem focused on HPC performance; RDMA support; separate metadata and storage targets; stripe-level parallelism; built-in benchmarking
- **Path Format**: `/unix/style/path`
- **Max Path Length**: Standard POSIX
- **Max File Size**: Underlying FS limit per target
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes | Journaling: Underlying FS | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: **Yes (parallel)**

---

## 2020s - AI, Edge & Content-Addressed Era

### Composefs (2023)

- **Year**: 2023 (Linux 6.5+)
- **Creator**: Alexander Larsson (Red Hat/GNOME)
- **Key Innovation**: Combines EROFS + OverlayFS + fs-verity; content-addressed object store for file data; EROFS images for metadata; integrity verification via fs-verity digests; enables sharing file content between container images even with different metadata; "reliability of disk images, flexibility of files"
- **Path Format**: `/unix/style/path` (mounted composite view)
- **Max Path Length**: Standard POSIX
- **Max File Size**: Underlying object store limits
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: No (content-addressed sharing) | ACLs: Yes | Journaling: N/A (read-only) | Snapshots: Implicit | Dedup: **Yes (content-addressed)** | Compression: Yes (EROFS) | Encryption: No | Distributed: No

### JuiceFS (2021)

- **Year**: 2021 (open-source release)
- **Creator**: Juicedata Inc.
- **Key Innovation**: Cloud-native POSIX filesystem; separates metadata (Redis/MySQL/TiKV/etc.) from data (any S3-compatible object store); 64MB chunks split into 4MB objects; Kubernetes CSI driver; strong consistency; supports 10 transactional databases for metadata
- **Path Format**: `/unix/style/path` (FUSE mount) or `jfs://volume/path`
- **Max Path Length**: Standard POSIX
- **Max File Size**: Limited by object store (typically unlimited)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes (POSIX) | Journaling: Yes (metadata DB transactions) | Snapshots: Yes (clone) | Dedup: No | Compression: Yes (LZ4, zstd) | Encryption: Yes (AES-256-GCM) | Distributed: **Yes (metadata + object store)**

### SeaweedFS (2015/2020s maturity)

- **Year**: 2015 (initial), matured significantly 2020s
- **Creator**: Chris Lu (chrislusf)
- **Key Innovation**: Inspired by Facebook Haystack; O(1) disk access for reads; 8MB data blocks; S3 API + FUSE + POSIX; changelog-based metadata replication; supports 24 different metadata backends; Iceberg table support (2024+)
- **Path Format**: `/buckets/path` (S3) or `/unix/style/path` (FUSE mount)
- **Max Path Length**: Standard POSIX (FUSE), S3 key limits (1024 chars)
- **Max File Size**: No hard limit (chunked)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes (FUSE) | Hard links: No | ACLs: Yes (S3 IAM) | Journaling: Yes (changelog) | Snapshots: No | Dedup: No | Compression: Yes | Encryption: Yes (server-side) | Distributed: **Yes**

### MinIO (2014/2020s dominance)

- **Year**: 2014 (founded), matured as S3 standard 2020s
- **Creator**: MinIO Inc. (Anand Babu Periasamy)
- **Key Innovation**: High-performance S3-compatible object storage; designed for AI/ML workloads; erasure coding; bitrot protection; bucket versioning; object locking; lambda compute; identity management (IAM/OIDC); multisite replication
- **Path Format**: `s3://bucket/prefix/object-key` or `https://endpoint/bucket/key`
- **Max Path Length**: 1024 bytes (S3 key limit)
- **Max File Size**: 50 TB per object
- **Features**: Hierarchical dirs: Virtual (prefix-based) | Symlinks: No | Hard links: No | ACLs: Yes (IAM policies) | Journaling: No | Snapshots: Yes (versioning) | Dedup: No (erasure coding) | Compression: No | Encryption: **Yes (SSE-S3, SSE-KMS, SSE-C)** | Distributed: **Yes (erasure coded)**

---

## Special Systems - Paradigm Breakers

### VMS Files-11 / ODS-2 (1977)

- **Year**: 1977 (VAX/VMS), ODS-2 standard since VMS V1
- **Creator**: Digital Equipment Corporation (Dave Cutler, Dick Hustvedt)
- **Key Innovation**: **Built-in file versioning** - every save creates a new version number; record-oriented I/O; file types enforced at OS level; RMS (Record Management Services) for structured data
- **Path Format**: `NODE"user password"::DEVICE:[DIRECTORY.SUBDIR]FILENAME.TYPE;VERSION`
  - Example: `BOSTON::DKA0:[USERS.JOHN]REPORT.TXT;3`
- **Max Path Length**: 39 chars per component (ODS-2), 236 chars per component (ODS-5)
- **Max File Size**: 2^31 - 1 blocks = ~1 TB (ODS-2), larger on ODS-5
- **Features**: Hierarchical dirs: Yes | Symlinks: No (logical names) | Hard links: No | ACLs: Yes (UIC-based + ACE lists) | Journaling: Yes (RMS journaling) | Snapshots: No (but versioning!) | Dedup: No | Compression: No | Encryption: No | Distributed: Yes (DECnet, cluster-wide)
- **Unique**: Automatic file versioning (`;1`, `;2`, `;3` ... `;32767`)

### MVS Datasets / z/OS (1974-present)

- **Year**: 1974 (MVS), evolved through OS/390, z/OS
- **Creator**: IBM
- **Key Innovation**: No filesystem in the Unix sense; everything is a "dataset" with explicit record structure; Partitioned Data Sets (PDS) as "directories" containing "members"; VSAM for indexed access; catalog system for dataset location; generation data groups (GDGs) for versioning
- **Path Format**: `'HLQ.QUALIFIER.QUALIFIER.NAME'` or `'HLQ.QUALIFIER.NAME(MEMBER)'` for PDS members
  - Example: `'PROD.PAYROLL.DATA'` or `'SYS1.LINKLIB(IEFBR14)'`
- **Max Path Length**: 44 characters (dataset name), 8 characters (member name)
- **Max File Size**: 65,535 tracks per PDS; VSAM: 4 GB (basic), 128 TB (extended)
- **Features**: Hierarchical dirs: No (catalog hierarchy, flat datasets) | Symlinks: No (aliases) | Hard links: No | ACLs: Yes (RACF/ACF2/TopSecret) | Journaling: No | Snapshots: No (GDGs for versioning) | Dedup: No | Compression: Yes (hardware) | Encryption: Yes (ICSF) | Distributed: Yes (SYSPLEX)

### AS/400 Single-Level Storage / IFS (1988)

- **Year**: 1988 (AS/400 launch), IFS added in OS/400 V3 (1995)
- **Creator**: IBM (Frank Soltis, chief architect)
- **Key Innovation**: **Single-level storage** - no distinction between memory and disk; all objects exist at addresses in a single, flat 128-bit address space; objects are scattered across all disks automatically; the OS "doesn't know or care" if an object is in RAM or on disk; Integrated File System (IFS) provides a unified hierarchical view over traditional libraries and stream files
- **Path Format**: `/QSYS.LIB/LIBRARY.LIB/FILE.FILE/MEMBER.MBR` (library) or `/home/user/file` (IFS stream)
- **Max Path Length**: Varies by filesystem (QSYS: limited; IFS: 16MB theoretical)
- **Max File Size**: 1.4 TB (single DB file member)
- **Features**: Hierarchical dirs: Yes (IFS) | Symlinks: Yes (IFS) | Hard links: Yes (IFS) | ACLs: Yes (authority lists) | Journaling: Yes | Snapshots: No | Dedup: No | Compression: Yes | Encryption: No | Distributed: Yes (DDM/DRDA)
- **Unique**: 128-bit single-level address space; objects survive IPL (reboot); no "file system" in traditional sense for QSYS objects

### Plan 9 / 9P Protocol (1992)

- **Year**: 1987 (development), 1992 (public release)
- **Creator**: Bell Labs (Ken Thompson, Rob Pike, Dave Presotto, Phil Winterbottom)
- **Key Innovation**: **Everything is LITERALLY a file** (not metaphorically like Unix); all resources (network, processes, graphics, devices) accessed through filesystem namespace; per-process namespaces; union directories (multiple dirs stacked at one mount point); 9P protocol (only 13 message types) for all resource access over any transport; /proc filesystem (adopted by Linux); no root user (factotum handles auth)
- **Path Format**: `/unix/style/path` but per-process, dynamically composed via `bind` and `mount`
  - Network: `/net/tcp/0/data` (not `socket()` syscall)
  - Process: `/proc/PID/status`
  - Window: `/dev/draw/new`
- **Max Path Length**: No artificial limit
- **Max File Size**: 2^64 bytes
- **Features**: Hierarchical dirs: Yes | Symlinks: No (bind/mount instead) | Hard links: No | ACLs: Yes (per-server) | Journaling: No (fossil+venti archival) | Snapshots: Yes (Fossil) | Dedup: Yes (Venti CAS) | Compression: Yes (Venti) | Encryption: No (native); TLS transport | Distributed: **Yes (9P protocol over any transport)**
- **Unique**: Per-process mutable namespaces; union mounts; 9P as universal resource protocol

### Phantom OS (2009)

- **Year**: 2009 (public), development since early 2000s
- **Creator**: Dmitry Zavalishin
- **Key Innovation**: **No files at all** - persistent virtual memory replaces the filesystem concept entirely; applications never see OS restarts; any variable or data structure persists forever via pointer; global flat address space; memory protection at object level; everything is an object (not a file); snapshots of entire persistent memory state written to disk
- **Path Format**: **None** - objects accessed via pointers in persistent address space
- **Max Path Length**: N/A (no paths)
- **Max File Size**: N/A (no files)
- **Features**: All traditional FS features are N/A; replaced by: persistent objects, object-level security, single address space IPC, snapshot-based durability
- **Unique**: Complete elimination of the file abstraction; operating system as persistent object space

### Urbit / Clay (2013)

- **Year**: 2013 (Urbit public), Clay evolved through versions
- **Creator**: Curtis Yarvin (Mencius Moldbug) / Tlon Corporation
- **Key Innovation**: **Typed, global, referentially transparent namespace**; every file has a mark (type); revision control built into the filesystem; content is addressed by ship+desk+revision+path; functional/immutable by default; changes are events in a log
- **Path Format**: `/~ship-name/desk-name/revision/path/to/file`
  - Example: `/~sampel-sipnym/base/5/gen/hood/hi/hoon`
  - Beak (permanent name): `[ship desk case]`
- **Max Path Length**: No artificial limit (knot-separated)
- **Max File Size**: Limited by loom (2GB on 32-bit Urbit, larger on 64-bit)
- **Features**: Hierarchical dirs: Yes (arch nodes) | Symlinks: No | Hard links: No | ACLs: Yes (per-desk permissions) | Journaling: Yes (event log) | Snapshots: Yes (every revision) | Dedup: Implicit (referential transparency) | Compression: No | Encryption: Yes (Ames protocol) | Distributed: **Yes (global namespace across ships)**
- **Unique**: Typed files (marks); built-in DVCS; every file revision permanently addressable; functional namespace

### Nix Store (2003/2006)

- **Year**: 2003 (Nix thesis), 2006 (NixOS)
- **Creator**: Eelco Dolstra (Utrecht University)
- **Key Innovation**: **Input-addressed or content-addressed** store; every package at a unique path determined by hash of its build inputs; multiple versions coexist; atomic upgrades and rollbacks; no dependency hell; reproducible builds; closure-based dependency tracking
- **Path Format**: `/nix/store/<hash>-<name>[-version]`
  - Example: `/nix/store/1aq3wchnvv7yn0d6y1r3j129hjqmv2k3-my-package-1.0`
  - Derivations: `/nix/store/<hash>-<name>.drv`
- **Max Path Length**: Standard filesystem limits (usually ext4/Btrfs underneath)
- **Max File Size**: Underlying FS limits
- **Features**: Hierarchical dirs: Yes (within store paths) | Symlinks: Yes (profiles are symlink trees) | Hard links: Yes (dedup via hardlinks) | ACLs: No (root-owned store, daemon manages access) | Journaling: No (atomic via rename) | Snapshots: Yes (generations/profiles) | Dedup: **Yes (hardlinks for identical content)** | Compression: Yes (NAR archives) | Encryption: No | Distributed: Yes (binary caches, substituters)
- **Unique**: Hash-addressed packages; multiple versions coexist; atomic rollbacks; reproducible builds

---

## Network & Distributed Protocols

### NFS - Network File System (1984)

- **Year**: 1984 (v2), 1995 (v3), 2000 (v4), 2010 (v4.1/pNFS)
- **Creator**: Sun Microsystems
- **Key Innovation**: First widely-adopted network filesystem; stateless protocol (v2/v3); RPC-based; transparent remote file access; became the standard for Unix/Linux network storage
- **Path Format**: `server:/export/path` mounted to `/local/mount/path`
- **Max Path Length**: Standard POSIX
- **Max File Size**: v3: 2^63 bytes; v4: 2^64 bytes
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: Yes | ACLs: Yes (v4) | Journaling: Server-side | Snapshots: Server-side | Dedup: No | Compression: No | Encryption: Yes (Kerberos/RPCSEC_GSS in v4) | Distributed: **Yes (client-server)**
- **Unique**: Stateless design (v2/v3); pNFS parallel data access (v4.1)

### AFS - Andrew File System (1983)

- **Year**: 1983 (development at CMU), 1989 (Transarc, DCE/DFS)
- **Creator**: Carnegie Mellon University (John H. Howard, M. Satyanarayanan)
- **Key Innovation**: Whole-file caching on client; Kerberos authentication; volumes as management units; global namespace (/afs/cell/path); scalable to campus-wide deployments; influenced NFS v4
- **Path Format**: `/afs/cellname.edu/volume/path/to/file`
  - Example: `/afs/cs.cmu.edu/user/john/public/readme.txt`
- **Max Path Length**: Standard POSIX
- **Max File Size**: 2^31 bytes (originally), 2^63 (OpenAFS)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes | Hard links: No (across volumes) | ACLs: **Yes (directory-level, fine-grained)** | Journaling: No | Snapshots: Yes (read-only volumes) | Dedup: No | Compression: No | Encryption: Yes (Kerberos + fcrypt) | Distributed: **Yes (global namespace)**
- **Unique**: Global `/afs` namespace; whole-file caching; volume-based management

### SMB / CIFS (1983/1996)

- **Year**: 1983 (SMB1 by IBM), 1996 (CIFS by Microsoft), 2006 (SMB2), 2012 (SMB3)
- **Creator**: IBM (original), Microsoft (evolution)
- **Key Innovation**: Stateful file sharing protocol for Windows networks; opportunistic locking (oplocks); named pipes; print sharing; SMB2 reduced 100+ commands to 19; SMB3 added encryption, RDMA, multichannel, transparent failover
- **Path Format**: `\\server\share\directory\filename` (UNC path)
- **Max Path Length**: 260 chars (legacy), 32,767 with long path support
- **Max File Size**: Server filesystem limits (typically NTFS)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes (DFS) | Hard links: Server-dependent | ACLs: Yes (NTFS ACLs) | Journaling: Server-side | Snapshots: Yes (VSS) | Dedup: Server-dependent | Compression: Yes (SMB3) | Encryption: **Yes (AES-128-CCM/GCM in SMB3)** | Distributed: **Yes (DFS namespaces)**

---

## Optical Media File Systems

### High Sierra / ISO 9660 (1986/1988)

- **Year**: 1986 (High Sierra), 1988 (ISO 9660 standard)
- **Creator**: Industry consortium / ISO
- **Key Innovation**: Standard filesystem for CD-ROMs; three conformance levels; Level 1: 8.3 filenames; Level 2/3: up to 30 chars; read-only by design
- **Path Format**: `/DIRECTORY/FILENAME.EXT;VERSION`
- **Max Path Length**: Level 1: 8.3 per component, 8 levels deep; Level 2/3: 30 chars per component
- **Max File Size**: 4 GB (Level 1/2), 8 TB (Level 3 multi-extent)
- **Features**: Hierarchical dirs: Yes (8 levels max) | Symlinks: No | Hard links: No | ACLs: No | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### Rock Ridge (1991)

- **Year**: 1991
- **Creator**: IEEE SUSP/RRIP working group
- **Key Innovation**: Extension to ISO 9660 adding POSIX semantics; 255-char filenames; Unix permissions; symlinks; deep directory nesting; device files
- **Path Format**: `/unix/style/long/path/names`
- **Max Path Length**: 255 chars per component
- **Max File Size**: Same as ISO 9660
- **Features**: Hierarchical dirs: Yes (unlimited depth) | Symlinks: **Yes** | Hard links: Yes | ACLs: Unix permissions | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

### Joliet (1995)

- **Year**: 1995
- **Creator**: Microsoft
- **Key Innovation**: Extension to ISO 9660 adding Unicode (UCS-2) filenames up to 64 characters; used primarily on Windows
- **Path Format**: ISO 9660 with Unicode names
- **Max Path Length**: 64 Unicode chars per component
- **Max File Size**: Same as ISO 9660
- **Features**: Same as ISO 9660 + Unicode filenames

### UDF - Universal Disk Format (1995)

- **Year**: 1995 (Rev 1.00), 1996 (Rev 1.02 for DVD)
- **Creator**: OSTA (Optical Storage Technology Association)
- **Key Innovation**: Replaced ISO 9660 for DVDs and Blu-ray; read-write support; Unicode filenames; designed for both read-only and rewritable media; packet writing for CD-RW
- **Path Format**: `/directory/filename` (Unicode)
- **Max Path Length**: 255 characters per component
- **Max File Size**: 2 TB (Rev 1.02), 16 EB (Rev 2.60)
- **Features**: Hierarchical dirs: Yes | Symlinks: Yes (UDF 2.00+) | Hard links: Yes | ACLs: Yes | Journaling: No | Snapshots: No | Dedup: No | Compression: No | Encryption: No | Distributed: No

---

## Addressing Schemes & Path Formats Summary

This is the critical comparison for designing a unified path system.

### Location-Based Addressing

| System          | Format                        | Separator        | Example                        |
| --------------- | ----------------------------- | ---------------- | ------------------------------ |
| **Unix/Linux**  | `/root/path/file`             | `/`              | `/home/user/doc.txt`           |
| **Windows**     | `DRIVE:\path\file`            | `\`              | `C:\Users\file.txt`            |
| **UNC/SMB**     | `\\server\share\path`         | `\`              | `\\fileserv\data\report.doc`   |
| **Multics**     | `>root>path>file`             | `>`              | `>udd>user>file`               |
| **VMS**         | `NODE::DEV:[DIR]FILE.EXT;VER` | `.` (dir), mixed | `DKA0:[USERS.JOHN]F.TXT;3`     |
| **Classic Mac** | `Volume:Folder:File`          | `:`              | `HD:Documents:readme.txt`      |
| **MVS**         | `HLQ.QUAL.NAME(MEMBER)`       | `.`              | `SYS1.LINKLIB(IEFBR14)`        |
| **CP/M**        | `DRIVE:FILE.EXT`              | (flat)           | `A:PROGRAM.COM`                |
| **Amiga**       | `Volume:Dir/File`             | `:` + `/`        | `Work:Projects/code.c`         |
| **AS/400**      | `/QSYS.LIB/LIB.LIB/FILE.FILE` | `/` + `.`        | `/QSYS.LIB/PROD.LIB/DATA.FILE` |
| **NFS**         | `server:/export/path`         | `/`              | `nas:/vol/data/file`           |
| **AFS**         | `/afs/cell/vol/path`          | `/`              | `/afs/cs.cmu.edu/user/john`    |
| **ZFS**         | `/pool/dataset/path`          | `/`              | `/tank/data/docs/file.txt`     |

### Content-Based Addressing

| System          | Format                 | Addressing Mechanism     | Example                      |
| --------------- | ---------------------- | ------------------------ | ---------------------------- |
| **Git**         | `hash:path`            | SHA-1/SHA-256 of content | `a1b2c3d:src/main.c`         |
| **IPFS**        | `/ipfs/CID/path`       | Multihash CID (SHA-256)  | `/ipfs/QmX.../readme.md`     |
| **IPNS**        | `/ipns/name/path`      | Mutable pointer to CID   | `/ipns/k51.../docs/`         |
| **Nix**         | `/nix/store/hash-name` | Hash of build inputs     | `/nix/store/1aq3...-pkg-1.0` |
| **Venti**       | `score` (hash)         | SHA-1 of block content   | `abcd1234...` (raw score)    |
| **CAS/Centera** | `content-address`      | Hash of content          | `C=abcdef123456...`          |

### Typed/Semantic Addressing

| System         | Format                   | Addressing Mechanism             | Example                           |
| -------------- | ------------------------ | -------------------------------- | --------------------------------- |
| **Urbit/Clay** | `/~ship/desk/rev/path`   | Ship + desk + case + path        | `/~zod/base/5/gen/hi/hoon`        |
| **Plan 9**     | `/per-process/namespace` | Dynamically composed per-process | `/net/tcp/0/data`                 |
| **HDFS**       | `hdfs://nn:port/path`    | NameNode + path                  | `hdfs://master:9000/data/file`    |
| **S3/MinIO**   | `s3://bucket/key`        | Bucket + object key              | `s3://data/models/v1/weights.bin` |

### URI-Based Addressing (Modern)

| Protocol  | Format           | Example                     |
| --------- | ---------------- | --------------------------- |
| `file://` | Local filesystem | `file:///home/user/doc.txt` |
| `smb://`  | Windows shares   | `smb://server/share/file`   |
| `nfs://`  | NFS v4+          | `nfs://server/export/file`  |
| `hdfs://` | Hadoop           | `hdfs://namenode/data/file` |
| `s3://`   | Object storage   | `s3://bucket/prefix/object` |
| `ipfs://` | IPFS content     | `ipfs://bafybeig.../file`   |
| `ipns://` | IPFS names       | `ipns://k51.../path`        |

---

## Feature Matrix

### Legend

- Y = Yes (native support)
- N = No
- P = Partial / with extensions
- -- = Not applicable

### Local File Systems

| File System | Year | Hier. Dirs    | Symlinks | Hard Links | ACLs          | Journaling             | Snapshots | Dedup | Compression | Encryption     | Max File Size  |
| ----------- | ---- | ------------- | -------- | ---------- | ------------- | ---------------------- | --------- | ----- | ----------- | -------------- | -------------- |
| CTSS        | 1961 | N (2-level)   | N        | N          | N             | N                      | N         | N     | N           | N              | disk-limited   |
| OS/360      | 1964 | N             | N        | N          | P             | N                      | N         | N     | N           | N              | volume-limited |
| Multics     | 1965 | **Y (FIRST)** | Y        | Y          | **Y (FIRST)** | N                      | N         | N     | N           | N              | 256KW/segment  |
| Unix V6/UFS | 1973 | Y             | N        | Y          | N             | N                      | N         | N     | N           | N              | ~1 MB          |
| BSD FFS     | 1983 | Y             | Y        | Y          | N             | N                      | N         | N     | N           | N              | ~2 GB          |
| FAT12       | 1980 | Y (DOS2+)     | N        | N          | N             | N                      | N         | N     | N           | N              | 16 MB          |
| FAT16       | 1984 | Y             | N        | N          | N             | N                      | N         | N     | N           | N              | 2 GB           |
| HFS         | 1985 | Y             | N        | N          | N             | N                      | N         | N     | N           | N              | 2 GB           |
| Minix FS    | 1987 | Y             | Y        | Y          | N             | N                      | N         | N     | N           | N              | 64 MB          |
| Amiga FFS   | 1988 | Y             | Y        | Y          | N             | N                      | N         | N     | N           | N              | 4 GB           |
| VxFS        | 1989 | Y             | Y        | Y          | Y             | **Y (1st commercial)** | Y         | N     | N           | N              | 256 TB         |
| ext         | 1992 | Y             | Y        | Y          | N             | N                      | N         | N     | N           | N              | 2 GB           |
| ext2        | 1993 | Y             | Y        | Y          | P             | N                      | N         | N     | N           | N              | 2 TB           |
| NTFS        | 1993 | Y             | Y        | Y          | **Y**         | Y                      | Y (VSS)   | Y     | Y           | Y (EFS)        | 16 TB          |
| XFS         | 1994 | Y             | Y        | Y          | Y             | Y                      | N         | N     | N           | N              | 8 EB           |
| FAT32       | 1996 | Y             | N        | N          | N             | N                      | N         | N     | N           | N              | 4 GB           |
| HFS+        | 1998 | Y             | Y        | Y          | Y             | Y                      | N         | N     | Y           | Y              | 8 EB           |
| ReiserFS    | 2001 | Y             | Y        | Y          | Y             | Y                      | N         | N     | N           | N              | 1 EB           |
| ext3        | 2001 | Y             | Y        | Y          | Y             | Y                      | N         | N     | N           | N              | 2 TB           |
| JFS2        | 2001 | Y             | Y        | Y          | Y             | Y                      | P         | N     | P           | N              | 4 PB           |
| ZFS         | 2005 | Y             | Y        | Y          | Y             | Y                      | **Y**     | **Y** | **Y**       | Y              | 16 EB          |
| ext4        | 2008 | Y             | Y        | Y          | Y             | Y                      | N         | N     | N           | Y              | 16 TB          |
| Btrfs       | 2009 | Y             | Y        | Y          | Y             | Y                      | **Y**     | Y     | **Y**       | N              | 16 EB          |
| exFAT       | 2006 | Y             | N        | N          | N             | N                      | N         | N     | N           | N              | 16 EB          |
| F2FS        | 2012 | Y             | Y        | Y          | Y             | Y                      | N         | N     | Y           | Y              | 3.94 TB        |
| APFS        | 2017 | Y             | Y        | Y          | Y             | N (CoW)                | Y         | N     | N           | **Y (native)** | 8 EB           |
| bcachefs    | 2024 | Y             | Y        | Y          | Y             | Y                      | Y         | N     | **Y**       | **Y**          | 16 EB          |

### Distributed / Network File Systems

| File System | Year | POSIX       | Fault Tolerant     | Scalability       | Consistency              | Max Nodes | Protocol    |
| ----------- | ---- | ----------- | ------------------ | ----------------- | ------------------------ | --------- | ----------- |
| NFS         | 1984 | Y           | N (v2/3), P (v4)   | Moderate          | Weak (v2/3), Strong (v4) | Unlimited | NFS/RPC     |
| AFS         | 1983 | Y           | Y (read-only vols) | Campus-scale      | Callback-based           | Thousands | AFS/Rx      |
| SMB/CIFS    | 1983 | N (Windows) | Y (SMB3)           | Moderate          | Strong                   | Unlimited | SMB         |
| GFS/GFS2    | 1995 | Y           | Y                  | 32 nodes max      | Strong (DLM)             | 32        | Shared-disk |
| HDFS        | 2006 | P           | Y (3x replication) | Petabytes         | Eventually               | Thousands | HDFS        |
| GlusterFS   | 2006 | Y           | Y (replication)    | Petabytes         | Eventually               | Hundreds  | GlusterFS   |
| Lustre      | 2003 | Y           | Y (failover)       | Exabytes          | Strong                   | 100,000+  | LNET        |
| CephFS      | 2012 | Y           | Y (CRUSH)          | Exabytes          | Strong                   | Thousands | RADOS       |
| MooseFS     | 2008 | Y           | Y (replication)    | Petabytes         | Strong                   | Thousands | MFS         |
| BeeGFS      | 2014 | Y           | P                  | Petabytes         | Moderate                 | Thousands | BeeGFS/RDMA |
| IPFS        | 2015 | N           | Y (DHT)            | Global            | Eventual                 | Unlimited | libp2p      |
| JuiceFS     | 2021 | Y           | Y (S3 backend)     | Unlimited         | Strong                   | Unlimited | FUSE+S3     |
| SeaweedFS   | 2015 | P           | Y (replication)    | Billions of files | Eventual                 | Hundreds  | HTTP/gRPC   |

---

## Key Innovations Timeline

| Year | Innovation                            | System     | Impact                            |
| ---- | ------------------------------------- | ---------- | --------------------------------- |
| 1961 | Per-user directories                  | CTSS       | Files belong to users             |
| 1965 | Hierarchical directories              | Multics    | Tree structure for all files      |
| 1965 | Access Control Lists                  | Multics    | Fine-grained permissions          |
| 1971 | Everything-is-a-file                  | Unix       | Unified I/O abstraction           |
| 1973 | Inodes                                | Unix       | Metadata separate from data       |
| 1977 | File versioning                       | VMS        | Every save is a new version       |
| 1980 | File Allocation Table                 | FAT12      | Simple, universal interchange     |
| 1983 | Cylinder groups                       | BSD FFS    | Locality for performance          |
| 1983 | Network filesystem                    | NFS        | Transparent remote access         |
| 1983 | Kerberos auth + caching               | AFS        | Secure distributed access         |
| 1985 | B-tree catalog                        | HFS        | Fast lookups regardless of size   |
| 1988 | Single-level storage                  | AS/400     | Memory/disk unification           |
| 1989 | Journaling                            | VxFS       | Crash recovery without fsck       |
| 1992 | Per-process namespaces                | Plan 9     | Dynamic, composable namespaces    |
| 1992 | 9P protocol (13 msgs)                 | Plan 9     | Universal resource access         |
| 1993 | MFT + Alternate Data Streams          | NTFS       | Extensible file metadata          |
| 1994 | Write-anywhere layout                 | WAFL       | No fixed metadata locations       |
| 1994 | 64-bit from inception                 | XFS        | Future-proof addressing           |
| 2001 | Content-addressable storage           | Venti      | Hash = address                    |
| 2003 | Hash-addressed packages               | Nix        | Reproducible, atomic installs     |
| 2003 | Parallel distributed I/O              | Lustre     | HPC-scale throughput              |
| 2005 | Integrated volume manager + checksums | ZFS        | End-to-end data integrity         |
| 2006 | CRUSH algorithm                       | Ceph       | No lookup tables for placement    |
| 2009 | Copy-on-write B-tree + subvolumes     | Btrfs      | Writable snapshots                |
| 2009 | Persistent memory objects             | Phantom OS | No files at all                   |
| 2012 | Flash-optimized log structure         | F2FS       | SSD-native performance            |
| 2013 | Typed global namespace                | Urbit/Clay | Files have types and revisions    |
| 2014 | Union mount filesystem                | OverlayFS  | Container layering                |
| 2015 | Content-addressed P2P                 | IPFS       | Location-independent addressing   |
| 2017 | Space-sharing containers              | APFS       | Multiple volumes share free space |
| 2023 | EROFS + OverlayFS + fs-verity         | Composefs  | Verified, shared container images |

---

## Design Principles for a Unified Path System

Based on this comprehensive survey, the best ideas to incorporate:

### From Multics (1965)

- Hierarchical namespace with arbitrary depth
- First-class ACLs on every node

### From Unix (1971)

- Everything-is-a-file unification
- Simple, clean `/`-separated paths

### From VMS (1977)

- **Built-in versioning** (`;version` suffix)

### From Plan 9 (1992)

- **Per-process/per-context namespace composition**
- **Union mounts** (stack multiple sources at one path)
- Resources as files (network, processes, devices)

### From ZFS (2005)

- **Pool/dataset hierarchy** with inherited properties
- **End-to-end checksums** on everything
- **Instant snapshots** as first-class path components

### From Nix (2003)

- **Hash-addressed immutable content**
- Multiple versions coexisting
- Atomic operations via content addressing

### From IPFS (2015)

- **Content Identifiers (CIDs)** - content is its own address
- **Merkle DAG** for linking content
- Location independence

### From Urbit/Clay (2013)

- **Typed files** (every file has a mark/type)
- **Ship+desk+revision** addressing
- Built-in revision control

### From AS/400 (1988)

- **Single-level storage** - no memory/disk distinction
- Objects exist at addresses, not locations

### From APFS (2017)

- **Space-sharing containers** - volumes share a pool
- **Native per-file encryption**

### From Git (2005)

- **Merkle tree** structure for integrity
- **Content-addressable object store** (blob, tree, commit)

### From Composefs (2023)

- **Content-addressed data + separate metadata**
- **Integrity verification** built into mount

---

## Sources

- [Multics History](https://multicians.org/history.html)
- [Multics - Wikipedia](https://en.wikipedia.org/wiki/Multics)
- [Compatible Time-Sharing System - Wikipedia](https://en.wikipedia.org/wiki/Compatible_Time-Sharing_System)
- [Unix - Wikipedia](https://en.wikipedia.org/wiki/Unix)
- [OS/360 and successors - Wikipedia](https://en.wikipedia.org/wiki/OS/360_and_successors)
- [Virtual Storage Access Method - Wikipedia](https://en.wikipedia.org/wiki/Virtual_Storage_Access_Method)
- [File Allocation Table - Wikipedia](https://en.wikipedia.org/wiki/File_Allocation_Table)
- [Design of the FAT file system - Wikipedia](https://en.wikipedia.org/wiki/Design_of_the_FAT_file_system)
- [NTFS - Wikipedia](https://en.wikipedia.org/wiki/NTFS)
- [NTFS overview - Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/storage/file-server/ntfs-overview)
- [ext2 - Wikipedia](https://en.wikipedia.org/wiki/Ext2)
- [ext3 - Wikipedia](https://en.wikipedia.org/wiki/Ext3)
- [Understanding Linux filesystems: ext4 and beyond](https://opensource.com/article/18/4/ext4-filesystem)
- [ZFS - Wikipedia](https://en.wikipedia.org/wiki/ZFS)
- [History of ZFS Part 1 - Klara Systems](https://klarasystems.com/articles/history-of-zfs-part-1-the-birth-of-zfs/)
- [Btrfs - Wikipedia](https://en.wikipedia.org/wiki/Btrfs)
- [BTRFS documentation](https://btrfs.readthedocs.io/en/latest/Introduction.html)
- [Apple File System - Wikipedia](https://en.wikipedia.org/wiki/Apple_File_System)
- [Apple File System Guide - Apple Developer](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/Features/Features.html)
- [HFS Plus - Wikipedia](https://en.wikipedia.org/wiki/HFS_Plus)
- [Hierarchical File System (Apple) - Wikipedia](<https://en.wikipedia.org/wiki/Hierarchical_File_System_(Apple)>)
- [XFS - Wikipedia](https://en.wikipedia.org/wiki/XFS)
- [JFS (file system) - Wikipedia](<https://en.wikipedia.org/wiki/JFS_(file_system)>)
- [Comparison of file systems - Wikipedia](https://en.wikipedia.org/wiki/Comparison_of_file_systems)
- [9P (protocol) - Wikipedia](<https://en.wikipedia.org/wiki/9P_(protocol)>)
- [Plan 9 from Bell Labs - Wikipedia](https://en.wikipedia.org/wiki/Plan_9_from_Bell_Labs)
- [IPFS Merkle DAG docs](https://docs.ipfs.tech/concepts/merkle-dag/)
- [IPFS Content Addressing docs](https://docs.ipfs.tech/concepts/content-addressing/)
- [Files-11 - Wikipedia](https://en.wikipedia.org/wiki/Files-11)
- [Google File System - Wikipedia](https://en.wikipedia.org/wiki/Google_File_System)
- [Ceph File System docs](https://docs.ceph.com/en/reef/cephfs/)
- [Ceph (software) - Wikipedia](<https://en.wikipedia.org/wiki/Ceph_(software)>)
- [Network File System - Wikipedia](https://en.wikipedia.org/wiki/Network_File_System)
- [Andrew File System - Wikipedia](https://en.wikipedia.org/wiki/Andrew_File_System)
- [ISO 9660 - Wikipedia](https://en.wikipedia.org/wiki/ISO_9660)
- [Universal Disk Format - Wikipedia](https://en.wikipedia.org/wiki/Universal_Disk_Format)
- [Amiga Fast File System - Wikipedia](https://en.wikipedia.org/wiki/Amiga_Fast_File_System)
- [MINIX file system - Wikipedia](https://en.wikipedia.org/wiki/MINIX_file_system)
- [F2FS - Wikipedia](https://en.wikipedia.org/wiki/F2FS)
- [Bcachefs - Wikipedia](https://en.wikipedia.org/wiki/Bcachefs)
- [OverlayFS - Wikipedia](https://en.wikipedia.org/wiki/OverlayFS)
- [UnionFS - Wikipedia](https://en.wikipedia.org/wiki/UnionFS)
- [AS/400 Single Level Storage - Source Data](https://source-data.com/2020/04/27/what-is-ibm-i-iseries-as400-single-level-storage-and-why-should-i-care/)
- [Phantom OS - Wikipedia](https://en.wikipedia.org/wiki/Phantom_OS)
- [Urbit Clay Architecture](https://developers.urbit.org/reference/arvo/clay/architecture)
- [Nix Store Path Specification](https://nix.dev/manual/nix/2.22/protocols/store-path)
- [Content-addressable storage - Wikipedia](https://en.wikipedia.org/wiki/Content-addressable_storage)
- [Data set (IBM mainframe) - Wikipedia](<https://en.wikipedia.org/wiki/Data_set_(IBM_mainframe)>)
- [Git Objects documentation](https://git-scm.com/book/id/v2/Git-Internals-Git-Objects)
- [Merkle trees in Git and Bitcoin](https://initialcommit.com/blog/git-bitcoin-merkle-tree)
- [DECtape - Wikipedia](https://en.wikipedia.org/wiki/DECtape)
- [Write Anywhere File Layout - Wikipedia](https://en.wikipedia.org/wiki/Write_Anywhere_File_Layout)
- [Lustre (file system) - Wikipedia](<https://en.wikipedia.org/wiki/Lustre_(file_system)>)
- [Moose File System - Wikipedia](https://en.wikipedia.org/wiki/Moose_File_System)
- [Filesystem in Userspace - Wikipedia](https://en.wikipedia.org/wiki/Filesystem_in_Userspace)
- [exFAT - Wikipedia](https://en.wikipedia.org/wiki/ExFAT)
- [MinIO - Wikipedia](https://en.wikipedia.org/wiki/MinIO)
- [Composefs GitHub](https://github.com/composefs/composefs)
- [SeaweedFS vs JuiceFS - DZone](https://dzone.com/articles/seaweedfs-vs-juicefs-in-design-and-features)
- [GFS2 - Wikipedia](https://en.wikipedia.org/wiki/GFS2)
- [OCFS2 - Wikipedia](https://en.wikipedia.org/wiki/OCFS2)
