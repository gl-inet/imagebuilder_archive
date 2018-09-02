# Imagebuilder

Imagebuilder for GL.iNet devices. The Image Builder (previously called the Image Generator) is a pre-compiled environment suitable for creating custom images without the need for compiling them from source.

## System Requirements

- x86_64 platform
- Ubuntu or another linux distro
- Download the build environment:

```bash
$ sudo apt-get update
$ sudo apt-get install subversion build-essential git-core libncurses5-dev zlib1g-dev gawk flex quilt libssl-dev xsltproc libxml-parser-perl mercurial bzr ecj cvs unzip git wget
```

## Usage

To build all the router firmwares, run **./gl_image -a**. To build a specific firmware, run **./gl_image -p <image_name>**. You can list all the images names by running **./gl_image -l**.

Run **./gl_image -h** to see more details and advanced options.

## Complete Usage Example

To make an image for the **Mifi** with some extra packages included:

```bash
$ git clone https://github.com/gl-inet/imagebuilder.git
cd imagebuilder
$ ./gl_image -p mifi -e "openssh-sftp-server nano htop"
```

The compiled image becomes: *bin/mifi/openwrt-mifi-ar71xx-generic-gl-mifi-squashfs-sysupgrade.bin*

For other firmwares, the compiled firmware file is in **/bin/<device_name>/**.

## Advanced Configuration

All the GL device package configuration is done with the images.json file. The following options control the configuration:


    url: The url to the package server
    packages: The default packages included in all firmwares
    profiles: Configuration for each firmware
    {
        <image_name>:
        {
            profile: The name of the device. Run "make info" for a list of available devices.
            version: Firmware version. Generates a version file called /etc/glversion and overrides /etc/opk/distfeeds.conf with the version number
            imagebuilder: Image builder folder
            packages: Packages in the firmware. Variables include the default packages. Add the package name to include. "-" appended to the package name excludes the package, eg: "-mwan3"
        }
    }

Assuming that we have a helloworld.ipk(created by sdk), and we want to create a clean customized firmware for our ar150 device. Here is an example for user-defined configuration file, *myfirst.json* is filename:

```bash
{
	"url": "http://download.gl-inet.com/releases",
	"profiles": {
		"helloworld": {
			"profile": "gl-ar150",
			"version": "3.001",
			"imagebuilder": "openwrt-imagebuilder-ar71xx-generic_3.0",
			"packages": "luci helloworld"
		}
	}
}
```

Placing the helloworld.ipk to *glinet/ar71xx* folder, and running **./gl_image -c myfirst.json -p helloworld**

