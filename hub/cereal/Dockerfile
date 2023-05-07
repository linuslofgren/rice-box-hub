FROM rust


RUN apt-get update
RUN apt-get upgrade
RUN apt-get --with-new-pkgs upgrade
RUN apt-get update
RUN apt-get upgrade

RUN apt-get -y install libudev-dev


WORKDIR /usr/src/cereal

RUN echo "fn main() {}" > dummy.rs
COPY Cargo.toml .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN cargo build --release
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml


COPY . .

RUN cargo install --path .

CMD ["cereal"]