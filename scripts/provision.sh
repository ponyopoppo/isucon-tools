cp git_config ~/.gitconfig

sudo apt-get update -y
sudo apt-get install dstat iperf git htop vim emacs iftop -y
yes "" | bash <(curl -Ss https://my-netdata.io/kickstart.sh)
echo '(define-key key-translation-map (kbd "C-h") (kbd "<DEL>"))' > ~/.emacs
