FROM julia

RUN julia -e 'import Pkg;Pkg.add("JSON")'

COPY . .

CMD ["julia", "positioning.jl"]