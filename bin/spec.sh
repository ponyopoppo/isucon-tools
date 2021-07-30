if [ $# -ne 2 ]; then
    echo "Usage: `basename $0` {server_id} {server_host}" 1>&2
    echo "Example: `basename $0` server1 127.0.0.1:39591" 1>&2
    exit 1
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "DISCORD_WEBHOOK_URL must be set" 1>&2
    exit 1
fi

server_host=$2

spec_log_file=spec-$1.txt
spec_url=http://${server_host}/${spec_log_file}
service_log_file=services-$1.txt
service_url=http://${server_host}/${service_log_file}

cat << EOF > $spec_log_file
<<$1>>
$(lscpu | egrep "(Architecture|^CPU\(s\):|^Model name|Flags)" | sed -e "s/: */: /g")
$(lsmem | grep "Total online" | sed -e "s/Total online memory:      /Memory:/g")
$(lsblk | grep disk | cut -d' ' -f12 | sed -e "s/^/Disk: /g")
EOF

cat << EOF > $service_log_file
<<$1>>
$(systemctl list-unit-files --type=service)
EOF

sudo mv $spec_log_file $service_log_file "/var/log/isucon"
curl -X POST -H "Content-Type: application/json" -d "{\"content\":\"spec: ${spec_url}\nservices:${service_url}\"}" ${DISCORD_WEBHOOK_URL}
