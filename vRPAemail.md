Your vRPA is ready for deployment. Please download the image from the link below and install it on a supported virtualization platform (ESXi, Hyper-V, or VMware Workstation).
________________________________________
Deployment Requirements & Network Configuration
Minimum Specifications:
16 GB RAM
80 GB HDD
4 vCPUs
Network Configuration:
DHCP is enabled by default
For static IP setup, follow the instructions below and notify us when complete
Required Outbound Access:
Port 1194/UDP to 52.1.110.27
Ports 80 and 443/TCP for general internet access
SSL Inspection Exceptions:

Please ensure SSL inspection is disabled for the following domains:
*.docker.io
*.s3.amazonaws.com
________________________________________
Deployment Instructions
Hyper-V Users:

Create a new VM and attach the provided .vhd file as the virtual disk.
Once powered on, the VM will automatically connect to our secure server. A troubleshooting guide is included in the download package for common setup issues.
________________________________________
Download Details
Download Link:

[Insert Link Here]
ZIP Password: GreenBasic45T3
________________________________________
Static IP Setup Instructions
Log in to the VM:
Username: ipuser
Password: orangeR27zebra
Run the following command in Terminal:
sudo ./ip.change.script.sh

Enter the desired static IP address when prompted.
Press Enter to reboot when prompted.
After rebooting, the VM will retain the static IP address. Please notify us once this step is complete so we can verify connectivity.
________________________________________
If you have any questions or run into any issues, feel free to reach out.