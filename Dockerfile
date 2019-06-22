FROM debian:stretch-slim

RUN apt-get update && apt-get install -y \ 
    git \
    make \
    python2.7-dev

ENV SOURCE_DIR="/src"
WORKDIR ${SOURCE_DIR}

ENTRYPOINT ["python2.7", "gl_image"]
