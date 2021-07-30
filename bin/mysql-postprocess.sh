if [ $# -ne 2 ]; then
    echo "Usage: `basename $0` {server_id} {server_host}" 1>&2
    echo "Example: `basename $0` server1 127.0.0.1:39591" 1>&2
    exit 1
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "DISCORD_WEBHOOK_URL must be set" 1>&2
    exit 1
fi

(sudo ls /var/log/mysql/mysql-slow.log 2>&1) > /dev/null
if [ $? -ne 0 ]; then
    echo "There is no such file: /var/log/mysql/mysql-slow.log" 1>&2
    exit 1
fi

(which pt-query-digest 2>&1) > /dev/null
if [ $? -ne 0 ]; then
    echo "Please install pt-query-digest first by following https://www.notion.so/MySQL-e88178f037fe43bbabdca94de605bbc6#09854e50b3b049cba1d667f094294b71" 1>&2
    exit 1
fi

now=$(date "+%Y%m%d-%H%M%S")
server_host=$2

mysqlslow_log_file=mysqlslow-$now-$1.txt
mysqlslow_url=http://${server_host}/${mysqlslow_log_file}
ptquerydigest_log_file=ptquerydigest-$now-$1.txt
ptquerydigest_url=http://${server_host}/${ptquerydigest_log_file}

cat <<EOF > $mysqlslow_log_file
$(sudo mysqldumpslow /var/log/mysql/mysql-slow.log -s t)
EOF

cat <<EOF > $ptquerydigest_log_file
$(sudo pt-query-digest /var/log/mysql/mysql-slow.log)
EOF

sudo mv $mysqlslow_log_file $ptquerydigest_log_file "/var/log/isucon"
curl -X POST -H "Content-Type: application/json" -d "{\"content\":\"slowdump: ${mysqlslow_url}\npt-query-digest:${ptquerydigest_url}\"}" ${DISCORD_WEBHOOK_URL}

sudo mv /var/log/mysql/mysql-slow.log "/var/log/mysql/mysql-slow-${now}.log"
sudo systemctl restart mysql
