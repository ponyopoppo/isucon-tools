vagrant ssh-config > ssh.config
mkdir data
scp -F ssh.config fccpc_isucon:/var/log/nginx/access.log ./data
cp ./data/access.log ./data/access-$(date "+%Y_%m_%d-%H_%M_%S").log