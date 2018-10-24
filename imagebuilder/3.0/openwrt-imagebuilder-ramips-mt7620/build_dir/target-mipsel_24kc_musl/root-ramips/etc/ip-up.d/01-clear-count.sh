#!/bin/sh
dev=$(echo $2|cut -d '/' -f 3)
dir=modem.$(find /sys/devices/platform/  -name $dev |tail -n 1|cut -d '/' -f 8|cut -d ':' -f 1)
[ -f /tmp/$dir/fail_count ] && {
	rm /tmp/$dir/fail_count
}
echo "pppd up" >/dev/console
echo $@ >/dev/console
