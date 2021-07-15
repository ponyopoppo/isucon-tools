if [ $# -ne 1 ]; then
    echo "Usage: `basename $0` {server_id}" 1>&2
    echo "Example: `basename $0` server1" 1>&2
    exit 1
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "DISCORD_WEBHOOK_URL must be set" 1>&2
    exit 1
fi

tmp_local_file=$1.txt

cat << EOF > $tmp_local_file
<<< CPU INFO >>>
$(lscpu)

<<< MEM INFO >>>
$(lsmem)

<<< DISK INFO >>>
$(lsblk)

<<< SERVICE UNIT FILES >>>
$(systemctl list-unit-files --type=service)
EOF

curl -X POST -F "file=@${tmp_local_file}" ${DISCORD_WEBHOOK_URL}
rm $tmp_local_file
