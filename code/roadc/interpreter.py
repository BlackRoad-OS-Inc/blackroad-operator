"""
RoadC Language - Tree-Walking Interpreter
Executes AST nodes produced by the parser
Includes ternary runtime (BlackBox Protocol)
"""

from ast_nodes import *
from ternary import Trit, TernaryWord, TernaryRouter, ARRIVED, WAITING, CANCELLED


class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value


class BreakSignal(Exception):
    pass


class ContinueSignal(Exception):
    pass


class Environment:
    def __init__(self, parent=None):
        self.vars = {}
        self.parent = parent

    def get(self, name):
        if name in self.vars:
            return self.vars[name]
        if self.parent:
            return self.parent.get(name)
        raise NameError(f"Undefined variable '{name}'")

    def set(self, name, value):
        self.vars[name] = value

    def assign(self, name, value):
        if name in self.vars:
            self.vars[name] = value
            return
        if self.parent:
            self.parent.assign(name, value)
            return
        raise NameError(f"Undefined variable '{name}'")


class Interpreter:
    def __init__(self):
        self.global_env = Environment()
        self.router = TernaryRouter()
        self._setup_builtins()

    def _setup_builtins(self):
        """Register built-in functions including ternary operations and stdlib"""
        env = self.global_env
        import math, time, os, json, hashlib, random

        # Standard
        env.set('print', lambda *args: print(*args))
        env.set('len', len)
        env.set('range', lambda *a: list(range(*a)))
        env.set('str', str)
        env.set('int', int)
        env.set('float', float)
        env.set('type', lambda x: type(x).__name__)
        env.set('repr', repr)
        env.set('assert', lambda cond, msg="Assertion failed": None if cond else (_ for _ in ()).throw(AssertionError(msg)))

        # Ternary
        env.set('trit', lambda v=0: Trit(v))
        env.set('ARRIVED', ARRIVED)
        env.set('WAITING', WAITING)
        env.set('CANCELLED', CANCELLED)
        env.set('tword', lambda v=0, w=8: TernaryWord(v, w))

        # Routing
        env.set('route', lambda rid, paths: self.router.route(rid, paths))
        env.set('resolve', lambda rid, pid, result=None: self.router.resolve(rid, pid, result))
        env.set('route_status', lambda: self.router.status())

        # Math module
        env.set('math', {
            'pi': math.pi, 'e': math.e, 'tau': math.tau, 'inf': math.inf,
            'sqrt': math.sqrt, 'abs': abs, 'pow': pow, 'log': math.log,
            'log2': math.log2, 'log10': math.log10,
            'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
            'asin': math.asin, 'acos': math.acos, 'atan': math.atan, 'atan2': math.atan2,
            'floor': math.floor, 'ceil': math.ceil, 'round': round,
            'min': min, 'max': max, 'sum': sum,
            'factorial': math.factorial, 'gcd': math.gcd,
            'amundson': 1 / (2 * math.e),  # The irreducible gap
        })

        # Time module
        env.set('time', {
            'now': time.time, 'sleep': time.sleep,
            'ms': lambda: int(time.time() * 1000),
            'iso': lambda: time.strftime('%Y-%m-%dT%H:%M:%S'),
        })

        # IO module
        env.set('io', {
            'read': lambda path: open(os.path.expanduser(path)).read(),
            'write': lambda path, data: open(os.path.expanduser(path), 'w').write(data),
            'append': lambda path, data: open(os.path.expanduser(path), 'a').write(data),
            'exists': lambda path: os.path.exists(os.path.expanduser(path)),
            'input': input,
        })

        # JSON module
        env.set('json', {
            'parse': json.loads,
            'stringify': lambda obj, indent=None: json.dumps(obj, indent=indent, default=str),
        })

        # Crypto module
        env.set('crypto', {
            'sha256': lambda s: hashlib.sha256(s.encode()).hexdigest(),
            'md5': lambda s: hashlib.md5(s.encode()).hexdigest(),
            'random': random.random,
            'randint': random.randint,
            'choice': random.choice,
            'shuffle': lambda lst: (random.shuffle(lst), lst)[1],
        })

        # Functional helpers
        env.set('map', lambda fn, lst: [fn(x) for x in lst])
        env.set('filter', lambda fn, lst: [x for x in lst if fn(x)])
        env.set('reduce', lambda fn, lst, init=None: __import__('functools').reduce(fn, lst) if init is None else __import__('functools').reduce(fn, lst, init))
        env.set('zip', lambda *args: [list(t) for t in zip(*args)])
        env.set('enumerate', lambda lst: [[i, v] for i, v in enumerate(lst)])
        env.set('sorted', lambda lst, key=None, reverse=False: sorted(lst, key=key, reverse=reverse))
        env.set('reversed', lambda lst: list(reversed(lst)))

    def run(self, program):
        for stmt in program.statements:
            self.exec_statement(stmt, self.global_env)

    def exec_statement(self, stmt, env):
        if isinstance(stmt, VariableDeclaration):
            value = None
            if stmt.initializer:
                value = self.eval_expr(stmt.initializer, env)
            env.set(stmt.name, value)

        elif isinstance(stmt, Assignment):
            value = self.eval_expr(stmt.value, env)
            if isinstance(stmt.target, Identifier):
                env.assign(stmt.target.name, value)
            elif isinstance(stmt.target, IndexAccess):
                obj = self.eval_expr(stmt.target.object, env)
                index = self.eval_expr(stmt.target.index, env)
                obj[index] = value
            elif isinstance(stmt.target, MemberAccess):
                obj = self.eval_expr(stmt.target.object, env)
                if isinstance(obj, dict):
                    obj[stmt.target.member] = value

        elif isinstance(stmt, CompoundAssignment):
            if isinstance(stmt.target, Identifier):
                old = env.get(stmt.target.name)
                rhs = self.eval_expr(stmt.value, env)
                op = stmt.operator
                ops = {'+=': lambda a, b: a+b, '-=': lambda a, b: a-b,
                       '*=': lambda a, b: a*b, '/=': lambda a, b: a/b}
                env.assign(stmt.target.name, ops[op](old, rhs))

        elif isinstance(stmt, ExpressionStatement):
            self.eval_expr(stmt.expression, env)

        elif isinstance(stmt, FunctionDefinition):
            # Capture the defining environment for closures
            stmt._closure_env = env
            env.set(stmt.name, stmt)

        elif isinstance(stmt, ReturnStatement):
            value = self.eval_expr(stmt.value, env) if stmt.value else None
            raise ReturnSignal(value)

        elif isinstance(stmt, BreakStatement):
            raise BreakSignal()

        elif isinstance(stmt, ContinueStatement):
            raise ContinueSignal()

        elif isinstance(stmt, IfStatement):
            self.exec_if(stmt, env)

        elif isinstance(stmt, WhileLoop):
            self.exec_while(stmt, env)

        elif isinstance(stmt, ForLoop):
            self.exec_for(stmt, env)

        elif isinstance(stmt, MatchStatement):
            self.exec_match(stmt, env)

        elif isinstance(stmt, TypeDefinition):
            self.exec_type_def(stmt, env)

        elif isinstance(stmt, SpawnStatement):
            self.exec_spawn(stmt, env)

        elif isinstance(stmt, ModuleDeclaration):
            pass  # Module declarations are metadata only

        elif isinstance(stmt, ImportStatement):
            pass  # Imports handled at module resolution layer

        elif isinstance(stmt, ExportStatement):
            self.exec_statement(stmt.statement, env)

    def exec_match(self, stmt, env):
        """Execute match statement with pattern matching"""
        value = self.eval_expr(stmt.value, env)
        for case in stmt.cases:
            match_env = Environment(parent=env)
            if self.match_pattern(case.pattern, value, match_env):
                self.exec_block(case.body, match_env)
                return

    def match_pattern(self, pattern, value, env):
        """Check if a value matches a pattern, binding variables in env"""
        if isinstance(pattern, WildcardPattern):
            return True
        if isinstance(pattern, LiteralPattern):
            lit_val = self.eval_expr(pattern.value, env)
            return value == lit_val
        if isinstance(pattern, IdentifierPattern):
            env.set(pattern.name, value)
            return True
        if isinstance(pattern, RangePattern):
            start = self.eval_expr(pattern.start, env)
            end = self.eval_expr(pattern.end, env)
            return start <= value < end
        if isinstance(pattern, ConstructorPattern):
            if isinstance(value, dict):
                if value.get('_type') == f"{pattern.type_name}.{pattern.variant}":
                    for i, field_pat in enumerate(pattern.fields):
                        field_vals = value.get('_fields', [])
                        if i < len(field_vals):
                            if not self.match_pattern(field_pat, field_vals[i], env):
                                return False
                    return True
            return False
        return False

    def exec_type_def(self, stmt, env):
        """Execute type definition — creates a constructor function"""
        field_names = [f.name for f in stmt.fields if not isinstance(f.default_value, FunctionDefinition)]
        field_defaults = {f.name: f.default_value for f in stmt.fields if f.default_value and not isinstance(f.default_value, FunctionDefinition)}
        methods = {f.name: f.default_value for f in stmt.fields if isinstance(f.default_value, FunctionDefinition)}

        def constructor(**kwargs):
            instance = {}
            for fname in field_names:
                if fname in kwargs:
                    instance[fname] = kwargs[fname]
                elif fname in field_defaults:
                    instance[fname] = self.eval_expr(field_defaults[fname], env)
                else:
                    instance[fname] = None
            instance['_type'] = stmt.name
            for mname, mdef in methods.items():
                mdef._closure_env = env
                instance[mname] = mdef
            return instance

        env.set(stmt.name, constructor)

    def exec_spawn(self, stmt, env):
        """Execute spawn statement — runs body (sync for now, async later)"""
        import threading
        spawn_env = Environment(parent=env)
        def run_spawn():
            try:
                self.exec_block(stmt.body, spawn_env)
            except ReturnSignal:
                pass
        t = threading.Thread(target=run_spawn, daemon=True)
        t.start()

    def exec_if(self, stmt, env):
        if self.eval_expr(stmt.condition, env):
            self.exec_block(stmt.then_block, env)
            return
        for condition, block in stmt.elif_blocks:
            if self.eval_expr(condition, env):
                self.exec_block(block, env)
                return
        if stmt.else_block:
            self.exec_block(stmt.else_block, env)

    def exec_while(self, stmt, env):
        while self.eval_expr(stmt.condition, env):
            try:
                self.exec_block(stmt.body, env)
            except BreakSignal:
                break
            except ContinueSignal:
                continue

    def exec_for(self, stmt, env):
        iterable = self.eval_expr(stmt.iterable, env)
        for item in iterable:
            env.set(stmt.variable, item)
            try:
                self.exec_block(stmt.body, env)
            except BreakSignal:
                break
            except ContinueSignal:
                continue

    def exec_block(self, statements, env):
        for stmt in statements:
            self.exec_statement(stmt, env)

    def eval_expr(self, expr, env):
        if isinstance(expr, IntegerLiteral):
            return expr.value
        if isinstance(expr, FloatLiteral):
            return expr.value
        if isinstance(expr, StringLiteral):
            return self.interpolate_string(expr.value, env)
        if isinstance(expr, BooleanLiteral):
            return expr.value
        if isinstance(expr, ColorLiteral):
            return expr.value
        if isinstance(expr, Identifier):
            return env.get(expr.name)
        if isinstance(expr, BinaryOp):
            return self.eval_binary(expr, env)
        if isinstance(expr, UnaryOp):
            operand = self.eval_expr(expr.operand, env)
            if expr.operator == '-':
                return -operand
            if expr.operator == 'not':
                return not operand
            if expr.operator == '~':
                return ~operand
            return +operand
        if isinstance(expr, FunctionCall):
            return self.eval_call(expr, env)
        if isinstance(expr, ListLiteral):
            return [self.eval_expr(e, env) for e in expr.elements]
        if isinstance(expr, DictLiteral):
            return {self.eval_expr(k, env): self.eval_expr(v, env) for k, v in expr.pairs}
        if isinstance(expr, SetLiteral):
            return {self.eval_expr(e, env) for e in expr.elements}
        if isinstance(expr, TupleLiteral):
            return tuple(self.eval_expr(e, env) for e in expr.elements)
        if isinstance(expr, RangeExpression):
            start = self.eval_expr(expr.start, env)
            end = self.eval_expr(expr.end, env)
            return range(start, end)
        if isinstance(expr, MemberAccess):
            obj = self.eval_expr(expr.object, env)
            name = expr.member
            # Support dict dot access and built-in methods
            if isinstance(obj, dict):
                if name == 'keys':
                    return lambda: list(obj.keys())
                if name == 'values':
                    return lambda: list(obj.values())
                if name == 'items':
                    return lambda: list(obj.items())
                if name in obj:
                    return obj[name]
            if isinstance(obj, list):
                if name == 'append':
                    return lambda val: obj.append(val)
                if name == 'pop':
                    return lambda: obj.pop()
                if name == 'length':
                    return len(obj)
            if isinstance(obj, str):
                if name == 'length':
                    return len(obj)
                if name == 'upper':
                    return lambda: obj.upper()
                if name == 'lower':
                    return lambda: obj.lower()
                if name == 'split':
                    return lambda sep=" ": obj.split(sep)
                if name == 'strip':
                    return lambda: obj.strip()
                if name == 'replace':
                    return lambda old, new: obj.replace(old, new)
                if name == 'startswith':
                    return lambda prefix: obj.startswith(prefix)
                if name == 'endswith':
                    return lambda suffix: obj.endswith(suffix)
                if name == 'contains':
                    return lambda sub: sub in obj
            raise AttributeError(f"'{type(obj).__name__}' has no attribute '{name}'")
        if isinstance(expr, IndexAccess):
            obj = self.eval_expr(expr.object, env)
            index = self.eval_expr(expr.index, env)
            return obj[index]
        if isinstance(expr, VectorLiteral):
            return tuple(self.eval_expr(c, env) for c in expr.components)
        if isinstance(expr, LambdaExpression):
            return self.eval_lambda(expr, env)
        if isinstance(expr, MatchExpression):
            return self.eval_match_expr(expr, env)
        raise RuntimeError(f"Unknown expression: {type(expr).__name__}")

    def eval_lambda(self, expr, env):
        """Evaluate lambda expression — returns a callable"""
        def closure(*args):
            call_env = Environment(parent=env)
            for param, arg in zip(expr.parameters, args):
                call_env.set(param.name, arg)
            return self.eval_expr(expr.body, call_env)
        return closure

    def eval_match_expr(self, expr, env):
        """Evaluate match as an expression (returns a value)"""
        value = self.eval_expr(expr.value, env)
        for case in expr.cases:
            match_env = Environment(parent=env)
            if self.match_pattern(case.pattern, value, match_env):
                if case.body:
                    for stmt in case.body[:-1]:
                        self.exec_statement(stmt, match_env)
                    last = case.body[-1]
                    if isinstance(last, ExpressionStatement):
                        return self.eval_expr(last.expression, match_env)
                    elif isinstance(last, ReturnStatement) and last.value:
                        return self.eval_expr(last.value, match_env)
                    self.exec_statement(last, match_env)
                return None
        return None

    def eval_binary(self, expr, env):
        left = self.eval_expr(expr.left, env)
        right = self.eval_expr(expr.right, env)
        op = expr.operator
        ops = {
            '+': lambda a, b: a+b, '-': lambda a, b: a-b,
            '*': lambda a, b: a*b, '/': lambda a, b: a/b,
            '%': lambda a, b: a%b, '**': lambda a, b: a**b,
            '==': lambda a, b: a==b, '!=': lambda a, b: a!=b,
            '<': lambda a, b: a<b, '>': lambda a, b: a>b,
            '<=': lambda a, b: a<=b, '>=': lambda a, b: a>=b,
            'and': lambda a, b: a and b, 'or': lambda a, b: a or b,
            '&': lambda a, b: a & b, '|': lambda a, b: a | b,
            '^': lambda a, b: a ^ b,
        }
        if op in ops:
            return ops[op](left, right)
        raise RuntimeError(f"Unknown operator: {op}")

    def interpolate_string(self, s, env):
        """Handle {var} interpolation in strings"""
        import re
        def replacer(match):
            varname = match.group(1)
            try:
                return str(env.get(varname))
            except NameError:
                return match.group(0)
        return re.sub(r'\{(\w+)\}', replacer, s)

    def eval_call(self, expr, env):
        if isinstance(expr.function, Identifier):
            name = expr.function.name
            builtins = {
                'print': lambda args: print(*args),
                'len': lambda args: len(args[0]),
                'range': lambda args: range(*args),
                'str': lambda args: str(args[0]),
                'int': lambda args: int(args[0]),
                'float': lambda args: float(args[0]),
                'bool': lambda args: bool(args[0]),
                'type': lambda args: type(args[0]).__name__,
                'abs': lambda args: abs(args[0]),
                'min': lambda args: min(*args) if len(args) > 1 else min(args[0]),
                'max': lambda args: max(*args) if len(args) > 1 else max(args[0]),
                'sum': lambda args: sum(args[0]),
                'sorted': lambda args: sorted(args[0]),
                'reversed': lambda args: list(reversed(args[0])),
                'enumerate': lambda args: list(enumerate(args[0])),
                'zip': lambda args: list(zip(*args)),
                'map': lambda args: list(map(args[0], args[1])),
                'filter': lambda args: list(filter(args[0], args[1])),
                'input': lambda args: input(args[0] if args else ''),
                'list': lambda args: list(args[0]) if args else [],
                'dict': lambda args: dict(args[0]) if args else {},
                'set': lambda args: set(args[0]) if args else set(),
                'round': lambda args: round(args[0], args[1] if len(args) > 1 else 0),
                'chr': lambda args: chr(args[0]),
                'ord': lambda args: ord(args[0]),
                'hex': lambda args: hex(args[0]),
                'bin': lambda args: bin(args[0]),
                'isinstance': lambda args: isinstance(args[0], args[1]),
            }
            if name in builtins:
                args = [self.eval_expr(a, env) for a in expr.arguments]
                return builtins[name](args)

        func = self.eval_expr(expr.function, env)

        # Handle lambda-like callables from member access
        if callable(func) and not isinstance(func, FunctionDefinition):
            # Separate positional and keyword args
            pos_args = []
            kw_args = {}
            for a in expr.arguments:
                val = self.eval_expr(a, env)
                if isinstance(val, dict) and len(val) == 1 and isinstance(a, DictLiteral):
                    # Keyword argument encoded as single-entry dict
                    for k, v in val.items():
                        kw_args[k] = v
                else:
                    pos_args.append(val)
            if kw_args:
                return func(*pos_args, **kw_args)
            return func(*pos_args)

        if not isinstance(func, FunctionDefinition):
            raise RuntimeError(f"'{func}' is not callable")

        args = [self.eval_expr(a, env) for a in expr.arguments]
        # Use closure environment if available, otherwise global
        parent_env = getattr(func, '_closure_env', self.global_env)
        call_env = Environment(parent=parent_env)
        for param, arg in zip(func.parameters, args):
            call_env.set(param.name, arg)

        try:
            self.exec_block(func.body, call_env)
        except ReturnSignal as ret:
            return ret.value
        return None
