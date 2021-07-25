if [ $# -ne 1 ]; then
    echo "Usage: `basename $0` {server_id}" 1>&2
    echo "Example: `basename $0` server1" 1>&2
    exit 1
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "DISCORD_WEBHOOK_URL must be set" 1>&2
    exit 1
fi

now=$(date "+%Y%m%d-%H%M%S")
tmp_local_file=mysqlslow-$now-$server_id.txt

cat <<EOF > $tmp_local_file
$(sudo mysqldumpslow /var/log/mysql/mysql-slow.log -s t)
EOF

curl -X POST -F "file=@${tmp_local_file}" ${DISCORD_WEBHOOK_URL}
rm $tmp_local_file
sudo mv /var/log/mysql/mysql-slow.log "/var/log/mysql/mysql-slow-${now}.log"
sudo systemctl restart