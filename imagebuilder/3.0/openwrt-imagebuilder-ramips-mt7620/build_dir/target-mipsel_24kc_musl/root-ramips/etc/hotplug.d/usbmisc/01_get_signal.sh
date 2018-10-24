#!/bin/sh

[ "$ACTION" = add ] || [ "$ACTION" = remove ] || exit 0
[ "${DEVNAME/[0-9]/}" = cdc-wdm ] || exit 0

BUS=$(echo $DEVPATH|cut -d '/' -f 8|cut -d ':' -f 1)

check_config()
{
        config=$(uci get glconfig.modem.bus  2>/dev/null)
		[ -z $config ] && return
        for i in $config
        do
                [ $i = $BUS ] && return
        done
        exit 0
}

check_config
[ "$ACTION" = add ] && modem_get_signal /dev/$DEVNAME  &

