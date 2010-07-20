#! coding: utf-8

filename = "test_result.txt"
output = "result.csv"

print "Reding input file..."
data = open(filename).read()

print "Processing..."
data = data.replace("\t", ',"').replace("\n", '"\n')

print "Writing ouput file..."
open(output, "w").write(data)

print "Done"