#!/bin/sh
awk /^remote/'{print FILENAME " " $2 " " $3}' *.ovpn *.txt > /tmp/client_ovpn_manager 2>/dev/null

pingserver(){
	line="$1"
	IFS=" "           
        set $line
	filename=$1
	ip=$2
	port=$3
        o=$(nmap -p $port $ip)                                      
        latency=$(echo "$o"|awk -F' |\\(' /latency/'{print $5}')
        open=$(echo "$o" |grep open)
        if [ -n "$open" ]                                
        then                                             
                echo host $ip:$port is live, latency=$latency
		sed -i "s/$ip $port/$ip $port live $latency/" /tmp/client_ovpn_manager
        else                               
                echo host $ip:$port is not live
		sed -i "s/$ip $port/$ip $port inactive/" /tmp/client_ovpn_manager
        fi                    
}

while read -r line
do
	pingserver "$line"

done < /tmp/client_ovpn_manager
