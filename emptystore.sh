#! /usr/bin/env bash

# Make empty file if it doesnt exist already
if ! test -f android/app/empty; then
    touch android/app/empty
fi

export KEYSTORE_FILE="empty"
export KEYSTORE_PASSWORD=""
export KEY_ALIAS=""
export KEY_PASSWORD=""
