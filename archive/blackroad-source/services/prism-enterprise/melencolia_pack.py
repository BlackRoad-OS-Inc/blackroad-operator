"""Asset generator for Dürer's *Melencolia I* motifs."""
from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Set, Tuple

import numpy as np
from scipy.spatial import ConvexHull

MAGIC_SQUARE = (
    (16, 3, 2, 13),
    (5, 10, 11, 8),
    (9, 6, 7, 12),
    (4, 15, 14, 1),
)
MAGIC_SUM = 34


@dataclass(frozen=True)
class TruncatedRhombohedron:
    """Representation of the truncated rhombohedron used in the solid."""

    vertices: np.ndarray
    faces: List[List[int]]
    normals: List[np.ndarray]

    def to_obj(self) -> str:
        """Export the solid as an OBJ string."""

        lines = []
        for vertex in self.vertices:
            lines.append(f"v {vertex[0]:.9f} {vertex[1]:.9f} {vertex[2]:.9f}")
        for face in self.faces:
            indices = " ".join(str(index + 1) for index in face)
            lines.append(f"f {indices}")
        return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Magic square utilities
# ---------------------------------------------------------------------------

def _validate_hide_cells(hide: Iterable[Tuple[int, int]]) -> List[Tuple[int, int]]:
    coords: List[Tuple[int, int]] = []
    for row, col in hide:
        if not (0 <= row < 4 and 0 <= col < 4):
            raise ValueError(f"Hide cell ({row}, {col}) outside the 4x4 grid")
        coords.append((row, col))
    return coords


def write_magic_square_svg(path: Path, hide_cells: Iterable[Tuple[int, int]] = ()) -> None:
    """Write the 4×4 magic square to *path* as an SVG document."""

    hidden = set(_validate_hide_cells(hide_cells))
    cell_size = 48
    margin = 24
    width = margin * 2 + cell_size * 4
    height = width
    lines = [
        (
            f"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" "
            f"height=\"{height}\" viewBox=\"0 0 {width} {height}\">"
        ),
        "  <defs>",
        "    <style>\n"
        "      .grid { fill: #f9fafb; stroke: #111827; stroke-width: 1.6; }\n"
        "      .cell-label { font-family: 'Fira Sans', 'Segoe UI', sans-serif; font-size: 18px; fill: #111827; }\n"
        "      .hidden { fill-opacity: 0; stroke: #9ca3af; stroke-dasharray: 4 4; }\n"
        "      .hidden text { opacity: 0; }\n"
        "    </style>",
        "  </defs>",
        (
            f"  <rect class=\"grid\" x=\"{margin}\" y=\"{margin}\" "
            f"width=\"{cell_size * 4}\" height=\"{cell_size * 4}\" />"
        ),
    ]

    for row in range(4):
        for col in range(4):
            x = margin + col * cell_size
            y = margin + row * cell_size
            value = MAGIC_SQUARE[row][col]
            classes = ["grid-cell"]
            if (row, col) in hidden:
                classes.append("hidden")
            class_attr = " ".join(classes)
            lines.append(
                (
                    f"  <g class=\"{class_attr}\" transform=\"translate({x},{y})\">"
                    f"<rect width=\"{cell_size}\" height=\"{cell_size}\" rx=\"4\" ry=\"4\" />"
                    f"<text class=\"cell-label\" x=\"{cell_size / 2}\" y=\"{cell_size / 2 + 6}\" "
                    f"text-anchor=\"middle\">{value}</text></g>"
                )
            )

    lines.append("</svg>")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_magic_square_json(path: Path) -> None:
    """Export the magic square entries and invariants as JSON."""

    payload = {
        "grid": MAGIC_SQUARE,
        "magic_sum": MAGIC_SUM,
        "row_sums": [MAGIC_SUM] * 4,
        "column_sums": [MAGIC_SUM] * 4,
        "diagonal_sums": [MAGIC_SUM, MAGIC_SUM],
        "corners_sum": MAGIC_SUM,
        "center_sum": MAGIC_SUM,
        "signature": [1, 5, 1, 4],
    }
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# Truncated rhombohedron construction
# ---------------------------------------------------------------------------

def _unique_rows(points: Iterable[Sequence[float]], tol: float = 1e-9) -> np.ndarray:
    unique: List[np.ndarray] = []
    for point in points:
        candidate = np.asarray(point, dtype=float)
        if any(np.linalg.norm(candidate - existing) < tol for existing in unique):
            continue
        unique.append(candidate)
    return np.vstack(unique)


def _generate_rhombohedron_vertices(edge: float, alpha: float) -> np.ndarray:
    u = np.array([edge, 0.0, 0.0])
    v = np.array([edge * math.cos(alpha), edge * math.sin(alpha), 0.0])
    w = np.array([edge * math.cos(alpha), 0.0, edge * math.sin(alpha)])
    vertices = []
    for su in (-0.5, 0.5):
        for sv in (-0.5, 0.5):
            for sw in (-0.5, 0.5):
                vertices.append(su * u + sv * v + sw * w)
    return np.array(vertices)


def _truncate_vertices(
    vertices: np.ndarray, u: np.ndarray, v: np.ndarray, w: np.ndarray, cut_ratio: float
) -> np.ndarray:
    top = 0.5 * (u + v + w)
    bottom = -top
    top_points = [top - cut_ratio * vec for vec in (u, v, w)]
    bottom_points = [bottom + cut_ratio * vec for vec in (u, v, w)]
    retained = [p for p in vertices if not (np.allclose(p, top) or np.allclose(p, bottom))]
    retained.extend(top_points)
    retained.extend(bottom_points)
    return _unique_rows(retained)


def _order_face_vertices(
    vertices: np.ndarray, indices: Sequence[int], expected_normal: np.ndarray
) -> List[int]:
    centroid = vertices[list(indices)].mean(axis=0)
    ref_vector = None
    for idx in indices:
        vector = vertices[idx] - centroid
        if np.linalg.norm(vector) > 1e-9:
            ref_vector = vector
            break
    if ref_vector is None:
        raise ValueError("Degenerate face with coincident vertices detected")
    ref_unit = ref_vector / np.linalg.norm(ref_vector)
    perpendicular = np.cross(expected_normal, ref_unit)
    perpendicular /= np.linalg.norm(perpendicular)

    angles: List[Tuple[float, int]] = []
    for idx in indices:
        vec = vertices[idx] - centroid
        x = float(np.dot(vec, ref_unit))
        y = float(np.dot(vec, perpendicular))
        angles.append((math.atan2(y, x), idx))
    ordered = [idx for angle, idx in sorted(angles)]

    ordered_vectors = vertices[ordered] - centroid
    area_vector = np.zeros(3)
    for i in range(len(ordered)):
        v0 = ordered_vectors[i]
        v1 = ordered_vectors[(i + 1) % len(ordered)]
        area_vector += np.cross(v0, v1)
    if np.dot(area_vector, expected_normal) < 0:
        ordered.reverse()
    return ordered


def _group_coplanar_faces(hull: ConvexHull) -> Tuple[List[List[int]], List[np.ndarray]]:
    faces: List[List[int]] = []
    normals: List[np.ndarray] = []
    for simplex, equation in zip(hull.simplices, hull.equations):
        normal = equation[:3]
        offset = equation[3]
        norm = np.linalg.norm(normal)
        normal = normal / norm
        offset = offset / norm
        merged = False
        for idx, existing in enumerate(normals):
            if np.allclose(normal, existing, atol=1e-8) and math.isclose(
                offset, np.dot(existing, hull.points[faces[idx][0]]), rel_tol=1e-8, abs_tol=1e-8
            ):
                new_indices = set(faces[idx]) | set(simplex.tolist())
                faces[idx] = _order_face_vertices(hull.points, list(new_indices), existing)
                merged = True
                break
        if not merged:
            ordered = _order_face_vertices(hull.points, simplex.tolist(), normal)
            faces.append(ordered)
            normals.append(normal)
    return faces, normals


def build_truncated_rhombohedron(edge: float = 1.0, cut_ratio: float = 0.35) -> TruncatedRhombohedron:
    """Construct the truncated rhombohedron geometry."""

    if not (0.0 < cut_ratio < 0.5):
        raise ValueError("cut_ratio must lie in (0, 0.5)")
    alpha = math.radians(63.43494882292201)  # prolate golden rhombohedron angle
    u = np.array([edge, 0.0, 0.0])
    v = np.array([edge * math.cos(alpha), edge * math.sin(alpha), 0.0])
    w = np.array([edge * math.cos(alpha), 0.0, edge * math.sin(alpha)])
    base_vertices = _generate_rhombohedron_vertices(edge, alpha)
    truncated_vertices = _truncate_vertices(base_vertices, u, v, w, cut_ratio)
    hull = ConvexHull(truncated_vertices)
    faces, normals = _group_coplanar_faces(hull)
    return TruncatedRhombohedron(vertices=hull.points, faces=faces, normals=normals)


# ---------------------------------------------------------------------------
# Net unfolding and export
# ---------------------------------------------------------------------------

def _polygon_area(vertices: np.ndarray) -> float:
    centroid = vertices.mean(axis=0)
    shifted = vertices - centroid
    area_vector = np.zeros(3)
    for i in range(len(vertices)):
        v0 = shifted[i]
        v1 = shifted[(i + 1) % len(vertices)]
        area_vector += np.cross(v0, v1)
    return 0.5 * np.linalg.norm(area_vector)


def _edge_key(a: int, b: int) -> Tuple[int, int]:
    return (a, b) if a <= b else (b, a)


def _build_adjacency(faces: Sequence[Sequence[int]]) -> Dict[int, List[Tuple[int, int, int]]]:
    adjacency: Dict[int, List[Tuple[int, int, int]]] = {idx: [] for idx in range(len(faces))}
    edge_to_faces: Dict[Tuple[int, int], List[Tuple[int, int, int]]] = {}
    for face_id, face in enumerate(faces):
        for i in range(len(face)):
            a = face[i]
            b = face[(i + 1) % len(face)]
            key = _edge_key(a, b)
            edge_to_faces.setdefault(key, []).append((face_id, a, b))
    for key, face_refs in edge_to_faces.items():
        if len(face_refs) == 2:
            (f0, a0, b0), (f1, a1, b1) = face_refs
            adjacency[f0].append((f1, a0, b0))
            adjacency[f1].append((f0, a1, b1))
    return adjacency


def _rotation_matrix(axis: np.ndarray, angle: float) -> np.ndarray:
    axis = axis / np.linalg.norm(axis)
    x, y, z = axis
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    one_c = 1.0 - cos_a
    return np.array(
        [
            [cos_a + x * x * one_c, x * y * one_c - z * sin_a, x * z * one_c + y * sin_a],
            [y * x * one_c + z * sin_a, cos_a + y * y * one_c, y * z * one_c - x * sin_a],
            [z * x * one_c - y * sin_a, z * y * one_c + x * sin_a, cos_a + z * z * one_c],
        ]
    )


def _rotate_points(points: np.ndarray, axis: np.ndarray, angle: float, origin: np.ndarray) -> np.ndarray:
    rotation = _rotation_matrix(axis, angle)
    shifted = points - origin
    return shifted @ rotation.T + origin


def unfold_net(poly: TruncatedRhombohedron) -> Dict[int, np.ndarray]:
    """Compute a 2D unfolding of the solid as a printable net."""

    areas = [
        _polygon_area(poly.vertices[face])
        for face in poly.faces
    ]
    root_face = int(np.argmax(areas))
    root_normal = poly.normals[root_face]
    root_vertices = poly.faces[root_face]
    centroid = poly.vertices[root_vertices].mean(axis=0)
    ref_vector = poly.vertices[root_vertices[1]] - centroid
    ref_vector = ref_vector / np.linalg.norm(ref_vector)
    basis_v = np.cross(root_normal, ref_vector)
    basis_v /= np.linalg.norm(basis_v)

    layout: Dict[int, np.ndarray] = {}
    vertex_map: Dict[int, Dict[int, np.ndarray]] = {}

    root_coords = []
    for idx in root_vertices:
        vec = poly.vertices[idx] - centroid
        root_coords.append(
            np.array([
                float(np.dot(vec, ref_vector)),
                float(np.dot(vec, basis_v)),
            ])
        )
    layout[root_face] = np.vstack(root_coords)
    vertex_map[root_face] = {
        idx: layout[root_face][i] for i, idx in enumerate(root_vertices)
    }

    adjacency = _build_adjacency(poly.faces)

    from collections import deque

    queue = deque([root_face])
    visited: Set[int] = {root_face}
    origin_reference = centroid
    u_global = ref_vector
    v_global = basis_v

    def project_to_global(point: np.ndarray) -> np.ndarray:
        vec = point - origin_reference
        return np.array([
            float(np.dot(vec, u_global)),
            float(np.dot(vec, v_global)),
        ])

    while queue:
        current = queue.popleft()
        current_polygon = layout[current]
        current_centroid = current_polygon.mean(axis=0)

        for neighbor, edge_a, edge_b in adjacency[current]:
            if neighbor in visited:
                continue
            current_coords = vertex_map[current]
            a_coord = current_coords[edge_a]
            b_coord = current_coords[edge_b]
            a_point = poly.vertices[edge_a]
            b_point = poly.vertices[edge_b]
            axis = b_point - a_point
            axis_norm = np.linalg.norm(axis)
            if axis_norm < 1e-9:
                continue
            axis /= axis_norm
            normal_current = poly.normals[current]
            normal_neighbor = poly.normals[neighbor]
            angle = math.acos(np.clip(np.dot(normal_neighbor, normal_current), -1.0, 1.0))
            if np.dot(np.cross(normal_neighbor, normal_current), axis) > 0:
                angle = -angle

            neighbor_vertices = poly.faces[neighbor]
            points3d = poly.vertices[neighbor_vertices]

            def attempt(angle_candidate: float) -> np.ndarray:
                rotated = _rotate_points(points3d, axis, angle_candidate, a_point)
                projected = np.vstack([project_to_global(p) for p in rotated])
                # align shared edge
                vertex_indices = neighbor_vertices
                mapping = {idx: projected[i] for i, idx in enumerate(vertex_indices)}
                translation = 0.5 * ((a_coord - mapping[edge_a]) + (b_coord - mapping[edge_b]))
                adjusted = projected + translation
                mapping = {idx: adjusted[i] for i, idx in enumerate(vertex_indices)}
                edge_dir = b_coord - a_coord
                edge_len = np.linalg.norm(edge_dir)
                if edge_len < 1e-9:
                    return adjusted
                edge_unit = edge_dir / edge_len
                normal2d = np.array([-edge_unit[1], edge_unit[0]])
                normal2d /= np.linalg.norm(normal2d)
                centroid_neighbor = adjusted.mean(axis=0)
                centroid_edge = 0.5 * (a_coord + b_coord)
                side_current = float(np.dot(current_centroid - centroid_edge, normal2d))
                side_neighbor = float(np.dot(centroid_neighbor - centroid_edge, normal2d))
                if side_current * side_neighbor > 0:
                    diffs = adjusted - centroid_edge
                    offsets = diffs @ normal2d
                    adjusted = adjusted - 2.0 * offsets[:, None] * normal2d
                return adjusted

            flattened = attempt(angle)
            fallback = attempt(-angle)
            # Prefer configuration that places centroid further from the edge
            def clearance(coords: np.ndarray) -> float:
                centroid_coords = coords.mean(axis=0)
                edge_dir_vec = b_coord - a_coord
                edge_dir_vec /= np.linalg.norm(edge_dir_vec)
                normal2d = np.array([-edge_dir_vec[1], edge_dir_vec[0]])
                centroid_edge = 0.5 * (a_coord + b_coord)
                diff = centroid_coords - centroid_edge
                return abs(float(np.dot(diff, normal2d)))

            if clearance(fallback) > clearance(flattened):
                flattened = fallback

            layout[neighbor] = flattened
            vertex_map[neighbor] = {
                idx: flattened[i] for i, idx in enumerate(neighbor_vertices)
            }
            visited.add(neighbor)
            queue.append(neighbor)

    return layout


def export_net_svg(
    poly: TruncatedRhombohedron,
    layout: Dict[int, np.ndarray],
    path: Path,
    padding: float = 12.0,
) -> None:
    """Render the unfolded net as an SVG file."""

    all_points = np.concatenate(list(layout.values()))
    min_x = float(np.min(all_points[:, 0]))
    min_y = float(np.min(all_points[:, 1]))
    max_x = float(np.max(all_points[:, 0]))
    max_y = float(np.max(all_points[:, 1]))

    width = (max_x - min_x) + padding * 2
    height = (max_y - min_y) + padding * 2
    translate = np.array([padding - min_x, padding - min_y])

    polygons: List[str] = []
    edge_segments: Dict[Tuple[int, int], List[Tuple[np.ndarray, np.ndarray]]] = {}

    for face_id, vertices in enumerate(poly.faces):
        coords = layout[face_id] + translate
        points_str = " ".join(f"{pt[0]:.6f},{pt[1]:.6f}" for pt in coords)
        polygons.append(
            f"  <polygon points=\"{points_str}\" fill=\"#f8fafc\" stroke=\"#111827\" stroke-width=\"0.12\" />"
        )
        for i in range(len(vertices)):
            a = vertices[i]
            b = vertices[(i + 1) % len(vertices)]
            segment = (coords[i], coords[(i + 1) % len(vertices)])
            key = _edge_key(a, b)
            edge_segments.setdefault(key, []).append(segment)

    fold_segments: List[Tuple[np.ndarray, np.ndarray]] = []
    cut_segments: List[Tuple[np.ndarray, np.ndarray]] = []
    for segments in edge_segments.values():
        if len(segments) == 2:
            fold_segments.append(segments[0])
        else:
            cut_segments.extend(segments)

    lines = [
        "<svg xmlns=\"http://www.w3.org/2000/svg\" "
        f"width=\"{width:.2f}\" height=\"{height:.2f}\" viewBox=\"0 0 {width:.6f} {height:.6f}\">",
        "  <g stroke-linejoin=\"round\" stroke-linecap=\"round\">",
    ]
    lines.extend(polygons)
    lines.append("  </g>")
    lines.append("  <g stroke=\"#2563eb\" stroke-dasharray=\"1.2 1.2\" stroke-width=\"0.12\">")
    for segment in fold_segments:
        start, end = segment
        lines.append(
            f"    <line x1=\"{start[0]:.6f}\" y1=\"{start[1]:.6f}\" x2=\"{end[0]:.6f}\" y2=\"{end[1]:.6f}\" />"
        )
    lines.append("  </g>")
    if cut_segments:
        lines.append("  <g stroke=\"#111827\" stroke-width=\"0.18\">")
        for start, end in cut_segments:
            lines.append(
                f"    <line x1=\"{start[0]:.6f}\" y1=\"{start[1]:.6f}\" x2=\"{end[0]:.6f}\" y2=\"{end[1]:.6f}\" />"
            )
        lines.append("  </g>")
    lines.append("</svg>")
    path.write_text("\n".join(lines), encoding="utf-8")


# ---------------------------------------------------------------------------
# Command line interface
# ---------------------------------------------------------------------------

def _parse_hide_cells(values: Iterable[str]) -> List[Tuple[int, int]]:
    cells: List[Tuple[int, int]] = []
    for value in values:
        if "," not in value:
            raise ValueError(f"Invalid cell specification '{value}', expected 'row,col'")
        row_s, col_s = value.split(",", 1)
        row = int(row_s.strip()) - 1
        col = int(col_s.strip()) - 1
        cells.append((row, col))
    return cells


def _build_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate Melencolia I reference assets.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("melencolia_assets"),
        help="Directory where the generated files will be written.",
    )
    parser.add_argument(
        "--edge-length",
        type=float,
        default=1.0,
        help="Edge length of the seed rhombohedron before truncation.",
    )
    parser.add_argument(
        "--cut-ratio",
        type=float,
        default=0.35,
        help="Fraction of each edge removed during vertex truncation (0 < r < 0.5).",
    )
    parser.add_argument(
        "--hide",
        action="append",
        default=["2,2", "2,3", "3,2", "3,3"],
        help="Cells to hide in the magic square as row,col (1-indexed). May repeat.",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> None:
    parser = _build_cli()
    args = parser.parse_args(argv)
    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    hide_cells = _parse_hide_cells(args.hide)
    svg_path = output_dir / "durer_magic_square.svg"
    write_magic_square_svg(svg_path, hide_cells)
    json_path = output_dir / "durer_magic_square.json"
    write_magic_square_json(json_path)

    solid = build_truncated_rhombohedron(edge=args.edge_length, cut_ratio=args.cut_ratio)
    obj_path = output_dir / "durer_solid.obj"
    obj_path.write_text(solid.to_obj(), encoding="utf-8")
    layout = unfold_net(solid)
    net_path = output_dir / "durer_solid_net.svg"
    export_net_svg(solid, layout, net_path)

    print(f"Magic square written to {svg_path} and {json_path}")
    print(f"Truncated rhombohedron exported as OBJ to {obj_path}")
    print(f"Printable net written to {net_path}")


if __name__ == "__main__":  # pragma: no cover - CLI utility
    main()
