# Amundson Quick Tools

## 1) Perspective Depth Solver
```bash
python tools/projective/depth_solver.py --ZA 0 --ZB 1   --A 100,400 --B 350,220 --C 270,260 --pretty
# or, if you already measured along the rail:
python tools/projective/depth_solver.py --ZA 0 --ZB 1 --s 0,5.0,8.25 --pretty
```

## 2) Power–Root Tools
```bash
python tools/number_theory/trig_roots.py sqrt01 --x 0.36
python tools/number_theory/trig_roots.py cheb --x 0.2 --n 5
python tools/number_theory/trig_roots.py root --a 3 --b 4 --n 5 --k 2
python tools/number_theory/trig_roots.py power --a 0.5 --b -0.5 --n 8
```
