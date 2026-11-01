"""Validate the static CV and package only its public files for GitHub Pages."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import unquote, urlsplit

PUBLIC_PATHS = ("index.html", "cv.html", "assets")
CSS_URL = re.compile(r"url\(\s*['\"]?([^)'\"\s]+)['\"]?\s*\)", re.IGNORECASE)


class HTMLReferences(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.urls.extend(
            value for key, value in attrs if key in {"src", "href", "poster"} and value
        )


def collect_public_files(root: Path) -> list[Path]:
    files = []
    for relative in PUBLIC_PATHS:
        source = root / relative
        if not source.exists():
            raise ValueError(f"Falta el archivo o directorio público: {relative}")
        candidates = [source, *sorted(source.rglob("*"))] if source.is_dir() else [source]
        for candidate in candidates:
            if candidate.is_symlink():
                raise ValueError(f"No se permiten enlaces simbólicos: {candidate.relative_to(root)}")
            if candidate.is_file():
                files.append(candidate)
    if (root / "CNAME").is_file():
        if (root / "CNAME").is_symlink():
            raise ValueError("CNAME no puede ser un enlace simbólico")
        files.append(root / "CNAME")
    return files


def validate_references(root: Path, files: list[Path]) -> int:
    published = set(files)
    errors = []
    references = 0
    for source in files:
        if source.suffix.lower() == ".html":
            parser = HTMLReferences()
            parser.feed(source.read_text(encoding="utf-8-sig"))
            urls = parser.urls
        elif source.suffix.lower() == ".css":
            urls = CSS_URL.findall(source.read_text(encoding="utf-8-sig"))
        else:
            continue
        for value in urls:
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            references += 1
            relative = unquote(parsed.path)
            if relative.startswith("/"):
                errors.append(f"{source.relative_to(root)}: usa una ruta relativa para Pages: {value}")
                continue
            target = (source.parent / relative).resolve()
            if target not in published:
                errors.append(f"{source.relative_to(root)}: referencia local fuera del artefacto o inexistente: {value}")
    if errors:
        raise ValueError("\n".join(errors))
    return references


def build(root: Path, output: str, check_only: bool = False) -> tuple[int, int]:
    root = root.resolve()
    files = collect_public_files(root)
    references = validate_references(root, files)
    if not check_only:
        destination = (root / output).resolve()
        if destination == root or not destination.is_relative_to(root):
            raise ValueError("La salida debe ser un subdirectorio del repositorio")
        if any(destination.is_relative_to(root / source) for source in PUBLIC_PATHS):
            raise ValueError("La salida no puede estar dentro de los archivos públicos")
        if destination.exists():
            raise ValueError(f"La salida ya existe: {destination}. Usa --check o una carpeta de salida nueva.")
        destination.mkdir(parents=True)
        for source in files:
            target = destination / source.relative_to(root)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    return len(files), references


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", default="_site", help="Directorio nuevo dentro del repositorio")
    parser.add_argument("--check", action="store_true", help="Solo validar, sin crear un artefacto")
    args = parser.parse_args()
    try:
        files, references = build(args.root, args.output, args.check)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"Validación correcta: {files} archivos públicos y {references} referencias locales.")
    if not args.check:
        print(f"Artefacto preparado en: {(args.root / args.output).resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
