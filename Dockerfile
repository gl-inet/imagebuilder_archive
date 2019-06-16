FROM debian:stretch-slim

RUN apt-get update && apt-get install -y \ 
    python \
    subversion \
    build-essential \
    git-core \
    libncurses5-dev \
    zlib1g-dev \
    gawk \
    flex \
    quilt \
    libssl-dev \
    xsltproc \
    libxml-parser-perl \
    mercurial \
    bzr \
    ecj \
    cvs \
    unzip \
    git \
    wget

ENV SOURCE_DIR="/src"
WORKDIR ${SOURCE_DIR}

ENTRYPOINT ["/usr/bin/python", "gl_image"]