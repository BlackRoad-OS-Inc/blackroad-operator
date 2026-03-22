// Created with Pyto

#include <Python.h>

static PyObject* _main(PyObject* self, PyObject* args) {
    printf("Hello World!\n");
    return Py_None;
}

// Our Module's Function Definition struct
// We require this `NULL` to signal the end of our method
// definition
static PyMethodDef lucidiaMethods[] = {
    { "main", _main, METH_NOARGS, "docstring here" },
    { NULL, NULL, 0, NULL }
};

// Our Module Definition struct
static struct PyModuleDef lucidiaModule = {
    PyModuleDef_HEAD_INIT,
    "lucidia",
    "docstring here",
    -1,
    lucidiaMethods
};

// Initializes our module using our above struct
PyMODINIT_FUNC PyInit_lucidia(void) {
    return PyModule_Create(&lucidiaModule);
}
