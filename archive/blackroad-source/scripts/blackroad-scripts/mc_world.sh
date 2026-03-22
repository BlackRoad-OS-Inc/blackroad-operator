#!/bin/bash
awk 'BEGIN {
  w=100; h=50; ox=50; oy=5; s=4
  
  for(i=0;i<h;i++)for(j=0;j<w;j++)m[i,j]=32
  
  # All blocks as "x,y,z" strings
  nb=0
  b[nb++]="0,0,0";b[nb++]="1,0,0";b[nb++]="2,0,0";b[nb++]="3,0,0"
  b[nb++]="0,0,1";b[nb++]="1,0,1";b[nb++]="2,0,1";b[nb++]="3,0,1"
  b[nb++]="0,0,2";b[nb++]="1,0,2";b[nb++]="2,0,2";b[nb++]="3,0,2"
  b[nb++]="0,0,3";b[nb++]="1,0,3";b[nb++]="2,0,3";b[nb++]="3,0,3"
  # walls
  b[nb++]="0,1,0";b[nb++]="3,1,0";b[nb++]="0,1,3";b[nb++]="3,1,3"
  b[nb++]="0,2,0";b[nb++]="3,2,0";b[nb++]="0,2,3";b[nb++]="3,2,3"
  b[nb++]="0,1,1";b[nb++]="0,1,2";b[nb++]="3,1,1";b[nb++]="3,1,2"
  b[nb++]="0,2,1";b[nb++]="0,2,2";b[nb++]="3,2,1";b[nb++]="3,2,2"
  b[nb++]="1,1,0";b[nb++]="2,1,0";b[nb++]="1,2,0";b[nb++]="2,2,0"
  b[nb++]="1,1,3";b[nb++]="2,1,3";b[nb++]="1,2,3";b[nb++]="2,2,3"
  # roof
  b[nb++]="0,3,0";b[nb++]="1,3,0";b[nb++]="2,3,0";b[nb++]="3,3,0"
  b[nb++]="0,3,1";b[nb++]="1,3,1";b[nb++]="2,3,1";b[nb++]="3,3,1"
  b[nb++]="0,3,2";b[nb++]="1,3,2";b[nb++]="2,3,2";b[nb++]="3,3,2"
  b[nb++]="0,3,3";b[nb++]="1,3,3";b[nb++]="2,3,3";b[nb++]="3,3,3"
  
  # Sort by depth (back to front)
  for(i=0;i<nb;i++){
    split(b[i],t,","); depth[i]=t[1]+t[3]-t[2]; ord[i]=i
  }
  for(i=0;i<nb-1;i++)for(j=i+1;j<nb;j++){
    if(depth[ord[i]]>depth[ord[j]]){tmp=ord[i];ord[i]=ord[j];ord[j]=tmp}
  }
  
  # Render
  for(idx=0;idx<nb;idx++){
    split(b[ord[idx]],p,",")
    bx=p[1]*s; by=p[2]*s; bz=p[3]*s
    
    for(a=0;a<s;a++)for(e=0;e<s;e++){
      px=ox+(bx+a)-(bz+e); py=oy+int((bx+a+bz+e)/2)-by
      if(px>=0&&px<w&&py>=0&&py<h)m[py,px]=64
    }
    for(a=0;a<s;a++)for(e=0;e<s;e++){
      px=ox+(bx+a)-(bz+s-1); py=oy+int((bx+a+bz+s-1)/2)-by+e
      if(px>=0&&px<w&&py>=0&&py<h)m[py,px]=35
    }
    for(a=0;a<s;a++)for(e=0;e<s;e++){
      px=ox+(bx+s-1)-(bz+a); py=oy+int((bx+s-1+bz+a)/2)-by+e
      if(px>=0&&px<w&&py>=0&&py<h)m[py,px]=43
    }
  }
  
  print "\033[2J\033[H\n  ◆ TERMINAL MINECRAFT ◆\n"
  for(i=0;i<h;i++){for(j=0;j<w;j++)printf"%c",m[i,j];print""}
}'
