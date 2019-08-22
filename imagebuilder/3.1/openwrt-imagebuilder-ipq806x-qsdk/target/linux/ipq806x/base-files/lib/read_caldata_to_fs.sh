#!/bin/sh
#
# Copyright (c) 2015 The Linux Foundation. All rights reserved.
# Copyright (C) 2011 OpenWrt.org

. /lib/ipq806x.sh

do_load_ipq4019_board_bin()
{
    local board=$(ipq806x_board_name)
    local mtdblock=$(find_mtd_part 0:ART)

    local apdk="/tmp"

    if [ -z "$mtdblock" ]; then
        # read from mmc
        mtdblock=$(find_mmc_part 0:ART)
    fi

    [ -n "$mtdblock" ] || return

    # load board.bin
    case "$board" in
            ap-dk0*)
                    mkdir -p ${apdk}
                    dd if=${mtdblock} of=${apdk}/wifi0.caldata bs=32 count=377 skip=128
                    dd if=${mtdblock} of=${apdk}/wifi1.caldata bs=32 count=377 skip=640
            ;;
            ap16* | ap148*)
                    mkdir -p ${apdk}
                    dd if=${mtdblock} of=${apdk}/wifi0.caldata bs=32 count=377 skip=128
                    dd if=${mtdblock} of=${apdk}/wifi1.caldata bs=32 count=377 skip=640
                    dd if=${mtdblock} of=${apdk}/wifi2.caldata bs=32 count=377 skip=1152
            ;;
    esac

	boraddata_dir=/lib/firmware/IPQ4019/hw.1
	if [ -f ${boraddata_dir}/s1300-v12-boarddata_1.bin ]; then
		case "$board" in
		ap-dk04.1-c1)
			cp ${boraddata_dir}/s1300-v12-boarddata_0.bin ${boraddata_dir}/boarddata_0.bin
			mv ${boraddata_dir}/s1300-v12-boarddata_0.bin ${boraddata_dir}/boardData_1_0_IPQ4019_Y9803_wifi0.bin
			cp ${boraddata_dir}/s1300-v12-boarddata_1.bin ${boraddata_dir}/boarddata_1.bin
			mv ${boraddata_dir}/s1300-v12-boarddata_1.bin ${boraddata_dir}/boardData_1_0_IPQ4019_DK04_5G.bin
			echo "s1300_bdata done. " >/dev/console
			;;
		*)
			echo "s1300_bdata skipped. " >/dev/console
			;;
		esac
	fi
}

