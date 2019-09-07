# Write .bashrc first to set environment values
set -ex

sudo systemctl restart ${isucon_mysql_name}
sudo systemctl restart ${isucon_nginx_name}
sudo systemctl restart ${isucon_app_name}

# See application log
journalctl -f -u ${isucon_app_name}