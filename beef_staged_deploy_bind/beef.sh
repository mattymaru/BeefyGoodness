#!/bin/bash

cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-handler.rb /opt/metasploit-framework/embedded/framework/lib/msf/core/handler/beef_bind.rb 
cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-stage-windows-x86.rb /opt/metasploit-framework/embedded/framework/modules/payloads/stages/windows/beef_shell.rb 
cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-stager-windows-x86.rb /opt/metasploit-framework/embedded/framework/modules/payloads/stages/windows/beef_bind.rb 
cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-stage-linux-x86.rb /opt/metasploit-framework/embedded/framework/modules/payloads/stages/linux/x86/beef_shell.rb
cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-stager-linux-x86.rb /opt/metasploit-framework/embedded/framework/modules/payloads/stages/linux/x86/beef_bind.rb
cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-stage-linux-x64.rb /opt/metasploit-framework/embedded/framework/modules/payloads/stages/linux/x64/beef_shell.rb
cp /usr/share/beef-xss/modules/exploits/beefbind/shellcode_sources/msf/beef_bind-stager-linux-x64.rb /opt/metasploit-framework/embedded/framework/modules/payloads/stages/linux/x64/beef_bind.rb

/bin/sh -c 'msfvenom -l | grep beef'

read -n 1 -s -r -p "Verify that copy worked! Press any key to continue if it did... Ctrl+C to quit if not!"

/bin/sh -c 'msfconsole -x "reload_all"'
