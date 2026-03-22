Amundson Tool Drops
===================

This bundle installs two stand-alone utilities:

* ``tools/projective/depth_solver.py`` — compute depth along a single rail
  or beam using projective cross-ratios.  The script accepts either raw
  pixel coordinates (``--A/--B/--C``) or scalar positions you already
  measured along the rail (``--s``).  Optional ``--vanish`` coordinates let
  you supply an explicit vanishing point when it is known.
* ``tools/number_theory/trig_roots.py`` — trigonometric helpers for unit
  interval square-roots, Chebyshev-style ``n``\ th roots on ``[-1, 1]``,
  and complex polar roots/powers.

Usage examples mirror the drop message:

.. code-block:: bash

   # Perspective depth along a measured rail
   python tools/projective/depth_solver.py --ZA 0 --ZB 1 \
     --A 100,400 --B 350,220 --C 270,260 --pretty

   # Pre-measured scalars along the rail
   python tools/projective/depth_solver.py --ZA 0 --ZB 1 --s 0,5.0,8.25 --pretty

   # Trigonometric root/power helpers
   python tools/number_theory/trig_roots.py sqrt01 --x 0.36
   python tools/number_theory/trig_roots.py cheb --x 0.2 --n 5
   python tools/number_theory/trig_roots.py root --a 3 --b 4 --n 5 --k 2
   python tools/number_theory/trig_roots.py power --a 0.5 --b -0.5 --n 8
