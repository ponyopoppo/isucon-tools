# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
    config.vm.define "fccpc_isucon" do |vagrant|
        vagrant.vm.box = "bento/ubuntu-16.04"
        vagrant.vm.network :private_network, ip:"192.168.33.15"
        vagrant.vm.network :forwarded_port, host: 9000, guest: 80
        vagrant.vm.provision "ansible" do |ansible|
            ansible.extra_vars = { ansible_ssh_user: 'vagrant' }
            ansible.playbook = "provisioning/main.yml"
            ansible.inventory_path = "provisioning/hosts"
            ansible.limit = "all"
        end
    end
end