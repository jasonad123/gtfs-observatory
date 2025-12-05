#!/usr/bin/bash

# Check if reference directory exists, create if it doesn't
if [ ! -d "reference" ]; then
    mkdir -p reference
fi

# Download the YAML file
curl -L https://mobilitydata.github.io/mobility-feed-api/DatabaseCatalogAPI.yaml -o reference/DatabaseCatalogAPI.yaml