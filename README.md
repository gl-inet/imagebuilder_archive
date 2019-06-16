# Imagebuilder

Imagebuilder for GL.iNet devices. The Image Builder (previously called the Image Generator) is a pre-compiled environment suitable for creating custom images without the need for compiling them from source.

## System Requirements

- x86_64 platform
- Linux distribution (like ubuntu or debian) or macOS using Docker as build environment

## Usage

To build all the router firmwares, run **python2.7 gl_image -a**. To build a specific firmware, run **python2.7 gl_image -p <image_name>**. You can list all the images names by running **python2.7 gl_image -l**.

Run **python2.7 gl_image -h** to see more details and advanced options.

## Local build environment

Install the following packages to prepare the build environment:

```bash
sudo apt-get update
sudo apt-get install -y python subversion build-essential git-core libncurses5-dev zlib1g-dev gawk flex quilt libssl-dev xsltproc libxml-parser-perl mercurial bzr ecj cvs unzip git wget
```

To make an image for the **Mifi** with some extra packages included:

```bash
git clone https://github.com/gl-inet/imagebuilder.git
cd imagebuilder
python2.7 gl_image -p mifi -e "openssh-sftp-server nano htop"
```

The compiled image becomes: *bin/gl-mifi/openwrt-mifi-ar71xx-generic-gl-mifi-squashfs-sysupgrade.bin*

For other firmwares, the compiled firmware file is in **/bin/<device_name>/**.

## Docker build environment

You can also use a docker container as build environment.

Get the source code by cloning the git repository:

```bash
git clone https://github.com/gl-inet/imagebuilder.git
cd imagebuilder
```

Build the docker image by running the following:

```bash
docker build --rm -t gl-inet/imagebuilder - < Dockerfile
```

To list all the possible firmware images names:

```bash
docker run -v "$(pwd)":/src gl-inet/imagebuilder -l
```

And to make an image for the **Mifi** with some extra packages included:

```bash
docker run -v "$(pwd)":/src gl-inet/imagebuilder -p mifi -e "openssh-sftp-server nano htop"
```

You'll find the compiled firmware image in *bin/gl-mifi/openwrt-mifi-ar71xx-generic-gl-mifi-squashfs-sysupgrade.bin* and **/bin/<device_name>/**.

## Advanced Configuration

All the GL device package configuration is done with the images.json file. The following options control the configuration:


    packages: The default packages included in all firmwares
    profiles: Configuration for each firmware
    {
        <image_name>:
        {
            profile: The name of the device. Run "make info" for a list of available devices.
            version: Firmware version. Generates a version file called /etc/glversion and overrides /etc/opk/distfeeds.conf with the version number
            imagebuilder: Image builder folder
            packages: Packages in the firmware. Variables include the default packages. Add the package name to include. "-" appended to the package name excludes the package, eg: "-mwan3"
            files: Files folder, it allows customized configuration files to be included in images built with Image Generator, all files from the folder will be copied into device's rootfs("/").
        }
    }

Assuming that we have a helloworld.ipk (created by the sdk), and we want to create a clean customized firmware for our AR150 device that includes this ipk, here is an example of a user-defined configuration file. We name it *myfirst.json*:

```bash
{
    "profiles":
    {
        "helloworld":
	{
            "profile": "gl-ar150",
            "version": "3.001",
            "imagebuilder": "3.0/openwrt-imagebuilder-ar71xx-generic",
            "packages": "luci helloworld"
        }
    }
}
```

Placing the helloworld.ipk in the *glinet/ar71xx* folder and running **python2.7 gl_image -c myfirst.json -p helloworld** will build our clean image with our helloworld.ipk included.

