from dumbo import sumreducer, nlargestreducer, nlargestcombiner, main
from heapq import nlargest
from math import sqrt

def mapper1(key, value):
    issuenr, commenter = value.split("\t")
    yield (int(issuenr), commenter), 1

def mapper2(key, value):
    yield key[0], (value, key[1])

def reducer2(key, values):
    values = nlargest(1000, values)
    norm = sqrt(sum(value[0]**2 for value in values))
    for value in values:
        yield (value[0], norm, key), value[1]

def mapper3(key, value):
    yield value, key

def mapper4(key, value):
    for left, right in ((l, r) for l in value for r in value if l != r):
        yield (left[1:], right[1:]), left[0]*right[0]

def mapper5(key, value):
    left, right = key
    yield left[1], (value / (left[0]*right[0]), right[1])

def runner(job):
    job.additer(mapper1, sumreducer, combiner=sumreducer)
    job.additer(mapper2, reducer2)
    job.additer(mapper3, nlargestreducer(10000), nlargestcombiner(10000))
    job.additer(mapper4, sumreducer, combiner=sumreducer)
    job.additer(mapper5, nlargestreducer(5), nlargestcombiner(5))

if __name__ == "__main__":
    main(runner)