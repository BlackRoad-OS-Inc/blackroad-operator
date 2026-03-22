param([string]$FilePath)
if (-not $FilePath -or -not (Test-Path $FilePath)) { exit }
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class RM {
    [StructLayout(LayoutKind.Sequential)]
    public struct UP { public uint pid; public long st; }
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct PI {
        public UP Process;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)] public string App;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)] public string Svc;
        public uint AT; public uint AS; public uint TS;
        [MarshalAs(UnmanagedType.Bool)] public bool R;
    }
    [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)]
    public static extern int RmStartSession(out uint h, int f, string k);
    [DllImport("rstrtmgr.dll")]
    public static extern int RmEndSession(uint h);
    [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)]
    public static extern int RmRegisterResources(uint h, uint nF, string[] fs, uint nA, IntPtr a, uint nS, IntPtr s);
    [DllImport("rstrtmgr.dll")]
    public static extern int RmGetList(uint h, out uint need, ref uint cnt, [In, Out] PI[] info, out uint reasons);
}
"@ -ErrorAction SilentlyContinue
$h = [uint32]0
[void][RM]::RmStartSession([ref]$h, 0, [Guid]::NewGuid().ToString())
[void][RM]::RmRegisterResources($h, 1, @($FilePath), 0, [IntPtr]::Zero, 0, [IntPtr]::Zero)
$n = [uint32]0; $c = [uint32]0; $r = [uint32]0
[void][RM]::RmGetList($h, [ref]$n, [ref]$c, $null, [ref]$r)
if ($n -gt 0) {
    $c = $n; $i = New-Object RM+PI[] $c
    [void][RM]::RmGetList($h, [ref]$n, [ref]$c, $i, [ref]$r)
    $i | ForEach-Object { $_.Process.pid }
}
[void][RM]::RmEndSession($h)
