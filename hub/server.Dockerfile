FROM denoland/deno:latest

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

# RUN mkdir positioning
# RUN mkdir positioning/socket
# RUN chown deno positioning/socket
# VOLUME positioning/socket
# Prefer not to run as root.
# USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
# COPY deps.ts .
# RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD server/ .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --unstable index.ts

CMD ["run", "--allow-net", "--unstable", "--allow-write", "--allow-read", "--allow-run", "--allow-env", "index.ts"]