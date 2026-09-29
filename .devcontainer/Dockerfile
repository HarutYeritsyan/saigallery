# syntax=docker/dockerfile:1

# Astro needs Node.js; GitHub Spec Kit's `specify` CLI needs uv (Python). Both come from
# bare-devcontainer's minimal, supply-chain-verified images: Node is the base, and uv's
# prebuilt, checksum-verified binary is copied in from its own image.
# https://github.com/bare-devcontainer/images
FROM ghcr.io/bare-devcontainer/uv:trixie AS uv

FROM ghcr.io/bare-devcontainer/node:26-trixie

USER root

COPY --from=uv /usr/local/bin/uv /usr/local/bin/uvx /usr/local/bin/
COPY --from=uv /usr/share/bash-completion/completions/uv /usr/share/bash-completion/completions/uvx /usr/share/bash-completion/completions/

# The node image ships Corepack disabled and has no npm/npx at all (see its README).
# Enabling Corepack needs root; it activates the pnpm/yarn shim matching this project's
# package.json "packageManager" field. Claude Code and Spec Kit's `specify` CLI are
# installed later, in postCreateCommand, as the "dev" user (their own installers, no npm).
RUN corepack enable

# System libraries for Playwright's Chromium (end-to-end and accessibility tests). This is the
# list `pnpm exec playwright install-deps --dry-run chromium` prints for Debian trixie, pinned
# here so the build is reproducible; regenerate it when Playwright is upgraded. The base image
# ships no apt package lists, so `apt-get update` comes first and the lists are removed after.
# The browser itself is downloaded later, as the "dev" user, with `pnpm exec playwright install chromium`.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      fonts-freefont-ttf fonts-ipafont-gothic fonts-liberation fonts-noto-color-emoji \
      fonts-tlwg-loma-otf fonts-unifont fonts-wqy-zenhei \
      libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 libcairo2 libcups2t64 \
      libdbus-1-3 libdrm2 libfontconfig1 libfreetype6 libgbm1 libglib2.0-0t64 libnspr4 libnss3 \
      libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
      libxkbcommon0 libxrandr2 xfonts-scalable xvfb \
 && rm -rf /var/lib/apt/lists/*

USER dev

RUN mkdir -p \
      /home/dev/.cache/ms-playwright \
      /home/dev/.cache/uv \
      /home/dev/.local/bin \
      /home/dev/.local/share/uv \
      /home/dev/.local/share/pnpm/store \
      /home/dev/.claude

# uv installs tool shims (e.g. `specify`) here; the Claude Code native installer does too.
ENV PATH=/home/dev/.local/bin:${PATH}
# uv hardlinks packages from its cache into a project's .venv. In a dev container the cache
# and the project live on different filesystems (volume vs. bind mount), so hardlinking
# would silently fall back to copying, with a warning, on every sync — opt into that upfront.
ENV UV_LINK_MODE=copy
