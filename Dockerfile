FROM debian:stretch-slim

RUN apt-get update && apt-get install -y \ 
    git \
    make \
    python

ENV SOURCE_DIR="/src"
WORKDIR ${SOURCE_DIR}

ENTRYPOINT ["python", "gl_image"]
