from=$(cd $(dirname $1) && pwd)/$(basename $1)
cd - > /dev/null
to=$(cd $(dirname $2) && pwd)/$(basename $2)
cd - > /dev/null

read -p "'$from' to '$to'? (y/N): " yn
if [ "$yn" = "y" ]; then
    sudo cp -r $from $to
    sudo mv $from ${from}_original
    sudo ln -s $to $from
    echo 'done'
fi
