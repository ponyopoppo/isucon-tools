#!/bin/bash

set -xe

enter_repo_name() {
    DEFAULT_REPO_NAME=isucon11-qual
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

install_apt_packages() {
    sudo apt-get update -y
    sudo apt-get install dstat iperf git htop vim emacs iftop -y
}

install_netdata() {
    yes "" | bash <(curl -Ss https://my-netdata.io/kickstart.sh)
    echo '(define-key key-translation-map (kbd "C-h") (kbd "<DEL>"))' >~/.emacs
}

install_node_js() {
    sudo node -v || echo 'node is not installed'
    read -p "Install node 14? (y/N): " yn
    case "$yn" in
    [yY]*) echo Installing ;;
    *) return ;;
    esac
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update -y
    sudo apt install nodejs yarn build-essential -y
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
    read -p "Register this key at https://github.com/ponyopoppo/${REPO_NAME}/settings/keys/new and press enter:"
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
install_apt_packages
install_netdata
install_node_js
install_ts_node
install_nginx
setup_ssh_key
setup_git
run_nginx_log_exporter

sudo mkdir /var/log/isucon || echo "Already exists"

echo "Finished!!"
