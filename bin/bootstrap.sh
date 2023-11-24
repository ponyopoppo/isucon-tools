#!/bin/bash

set -xe

enter_repo_name() {
    DEFAULT_REPO_NAME=isucon13
    read -p "Enter repository name (default: $DEFAULT_REPO_NAME):" REPO_NAME
    if [ -z "$REPO_NAME" ]; then
        REPO_NAME=$DEFAULT_REPO_NAME
    fi
    echo REPO_NAME=$REPO_NAME

    read -p "Instance id (default: 1)?" INSTANCE_ID
    if [ -z "$INSTANCE_ID" ]; then
        INSTANCE_ID=1
    fi
    echo INSTANCE_ID=$INSTANCE_ID
}

configure_ps1() {
    echo -e "\033[31m31 \033[32m32 \033[33m33 \033[34m34 \033[36m36 \033[0m"
    read -p "Color (default: 32)?" COLOR
    if [ -z "$COLOR" ]; then
        COLOR=32
    fi
    tmp="'\${debian_chroot:+(\$debian_chroot)}\[\033[01;'$COLOR'm\]\u@'$REPO_NAME$INSTANCE_ID'\[\033[00m\]\$(__git_ps1 \"(%s)\"):\[\033[01;34m\]\w\[\033[00m\]\\$ '"
    echo PS1=$tmp >>~/.bashrc
}

configure_editors() {
    echo '(define-key key-translation-map (kbd "C-h") (kbd "<DEL>"))' >~/.emacs
    echo set expandtab shiftwidth=4 softtabstop=4 number wrap title wildmenu ruler >~/.vimrc
}

install_apt_packages() {
    sudo apt-get update -y
    sudo apt-get install dstat iperf git htop vim emacs iftop -y
}

install_pt_query_digest() {
    # https://nishinatoshiharu.com/percona-slowquerylog/#pt-query-digest
    wget https://downloads.percona.com/downloads/percona-toolkit/3.3.1/binary/debian/bionic/x86_64/percona-toolkit_3.3.1-1.bionic_amd64.deb
    sudo apt-get install -y libdbd-mysql-perl libdbi-perl libio-socket-ssl-perl libnet-ssleay-perl libterm-readkey-perl && sudo dpkg -i percona-toolkit_3.3.1-1.bionic_amd64.deb
    rm percona-toolkit_3.3.1-1.bionic_amd64.deb
}

install_netdata() {
    yes "" | bash <(curl -Ss https://my-netdata.io/kickstart.sh)
}

install_node_js() {
    sudo node -v || echo 'node is not installed'
    NODE_MAJOR=20
    read -p "Install node $NODE_MAJOR? (y/N): " yn
    case "$yn" in
    [yY]*) echo Installing ;;
    *) return ;;
    esac
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
    sudo apt-get update -y
    sudo apt-get install nodejs yarn build-essential -y
}

install_ts_node() {
    sudo ts-node -v || echo 'ts-node is not installed'
    read -p "Install ts-node? (y/N): " yn
    case "$yn" in
    [yY]*) echo Installing ;;
    *) return ;;
    esac
    sudo npm i -g ts-node typescript
}

install_nginx() {
    nginx -v || echo 'nginx is not installed'
    read -p "If nginx version < 1.13.10, you should install newer nginx. Install nginx? (y/N): " yn
    case "$yn" in
    [yY]*) echo Installing ;;
    *) return ;;
    esac
    wget https://raw.githubusercontent.com/angristan/nginx-autoinstall/master/nginx-autoinstall.sh
    chmod +x nginx-autoinstall.sh
    sudo HEADLESS=y ./nginx-autoinstall.sh
}

setup_ssh_key() {
    ssh-keygen -t rsa -N '' -f ~/.ssh/id_rsa
    cat ~/.ssh/id_rsa.pub
    read -p "Register this key at https://github.com/fccpc/${REPO_NAME}/settings/keys/new and press enter:"
}

setup_git() {
    git config --global user.email "hoge@example.com"
    git config --global user.name "ISUCON Remote"

    wget https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash -O ~/.git-completion.bash
    chmod a+x ~/.git-completion.bash
    echo "source ~/.git-completion.bash" >>~/.bashrc

    wget https://raw.githubusercontent.com/git/git/master/contrib/completion/git-prompt.sh -O ~/.git-prompt.sh
    chmod a+x ~/.git-prompt.sh
    echo "source ~/.git-prompt.sh" >>~/.bashrc
}

run_nginx_log_exporter() {
    git clone https://github.com/ponyopoppo/isucon-tools.git
    cd ~/isucon-tools/nginx-log-exporter
    sudo sh -c "sed s:PROJECT_DIR:$(pwd):g service/nginx-log-exporter.service > /etc/systemd/system/nginx-log-exporter.service"
    sudo systemctl enable nginx-log-exporter
    sudo systemctl start nginx-log-exporter
    cd -
}

enter_repo_name
configure_ps1
configure_editors
install_apt_packages
install_pt_query_digest
install_netdata
install_node_js
install_ts_node
install_nginx
setup_ssh_key
setup_git
run_nginx_log_exporter

sudo mkdir /var/log/isucon || echo "Already exists"

echo "Finished!!"
