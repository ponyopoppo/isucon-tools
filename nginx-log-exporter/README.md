# Install on ubuntu
```
sudo sh -c "sed s:PROJECT_DIR:$(pwd):g service/nginx-log-exporter.service > /etc/systemd/system/nginx-log-exporter.service"
sudo systemctl enable nginx-log-exporter
sudo systemctl start nginx-log-exporter
```