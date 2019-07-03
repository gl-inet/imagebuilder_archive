FROM debian:stretch-slim

RUN apt update && apt install -y \ 
    git \
    make \
    python

ENV SOURCE_DIR="/src"
WORKDIR ${SOURCE_DIR}

ENTRYPOINT ["python", "gl_image"]
