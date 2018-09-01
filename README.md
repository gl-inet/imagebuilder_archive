# Imagebuilder

Imagebuilder for GL.iNet devices. The Image Builder (previously called the Image Generator) is a pre-compiled environment suitable for creating custom images without the need for compiling them from source.

## System Requirements

- x86_64 platform
- Ubuntu or another linux distro
- Download the build environment:

```bash
sudo apt-get update
sudo apt-get install subversion build-essential git-core libncurses5-dev zlib1g-dev gawk flex quilt libssl-dev xsltproc libxml-parser-perl mercurial bzr ecj cvs unzip git wget
```

## Usage

To build all the router firmwares, run **./gl_image -a**. To build a specific device, run **./gl_image -p <device_name>**. You can list all the devices names by running **./gl_image -l**.

Run **gl_image -h** to see more details and advanced options.

## Complete Usage Example

To make an image for the **Mifi** with some extra packages included:

```bash
git clone https://github.com/gl-inet/imagebuilder.git
cd imagebuilder
./gl_image -p mifi -e "openssh-sftp-server nano htop"
```

The compiled image becomes: *bin/mifi/openwrt-mifi-ar71xx-generic-gl-mifi-squashfs-sysupgrade.bin*

For other firmwares, the compiled firmware file is in **/bin/<device_name>/**, ending with **-squashfs-sysupgrade.bin**

## Advanced Configuration

All the GL device package configuration is done with the images.json file. The following options control the configuration:


    url: The url to the package server
    packages: The default packages included in all firmwares
    profiles: Configuration for each firmware
    {
        <device>:
        {
            profile: The name of the device. Run *make info* for a list of available devices.
            version: Firmware version. Generates a version file called **/etc/glversion** and overrides **/etc/opk/distfeeds.conf** with the version number
            imagebuilder: Image builder folder
            packages: Packages in the firmware. Variables include the default packages. Add the package name to include. "-" appended to the package name excludes the package, eg: "-mwan3"
        }
    }
