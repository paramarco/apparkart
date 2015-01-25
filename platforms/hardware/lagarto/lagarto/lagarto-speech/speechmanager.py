#########################################################################
#
# speechmanager
#
# Copyright (c) 2012 Daniel Berenguer <dberenguer@usapiens.com>
#
# This file is part of the lagarto project.
#
# lagarto  is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# lagarto is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with lagarto; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301
# USA
#
#########################################################################
__author__="Daniel Berenguer"
__date__  ="$Jan 23, 2012$"
#########################################################################

import os
import sys
import threading
import urllib, urllib2
import json
import subprocess
from xmltools import XmlSettings
from speechnetwork import SpeechNetwork

working_dir = os.path.dirname(__file__)
lagarto_dir = os.path.split(working_dir)[0]
lagarto_dir = os.path.join(lagarto_dir, "lagarto")
sys.path.append(lagarto_dir) 
from lagartocomms import LagartoServer


class SpeachProducer:
    """
    Class used to produce text to speech output
    """
    def get_tts_mp3(self, lang, text):
        """
        Retrieve mp3 file containing the recorded text
        
        @param lang language
        @param text text to be spoken
        """
        baseurl  = "http://translate.google.com/translate_tts"
        values   = { 'q': text, 'tl': lang }
        data     = urllib.urlencode(values)
        request  = urllib2.Request(baseurl, data)
        request.add_header("User-Agent", "Mozilla/5.0 (X11; U; Linux i686) Gecko/20071127 Firefox/2.0.0.11" )
        response = urllib2.urlopen(request)
        fpath = os.path.join(working_dir, "audio", "output.mp3")
        ofp = open(fpath,"wb")
        ofp.write(response.read())
        

    def speak(self, text):
        """
        Speek message
        
        @param text text to be spoken
        """
        # Generate mp3 file
        self.get_tts_mp3(self.language, text)

        # Play audio file
        subprocess.call(self.play_command)

        
    def __init__(self, parent, language):
        """
        Constructor
        
        @param parent parent object
        @param language language for the tts engine
        """
        ## Language
        self.language = language
        
        self.play_file = os.path.join(working_dir, "audio", parent.general_settings.play_file)

        strcommand = parent.general_settings.play_command.replace("${audio_file}", self.play_file)
        ## Playing command (list format)
        self.play_command = strcommand.split(' ')


class SpeechListener(threading.Thread):
    """
    Class used to listen for possible voice commands
    """
    def start_command_timer(self):
        """
        Schedule end of command
        """
        self.ready_for_command = True
        threading.Timer(10, self._terminate_command_window).start()


    def _terminate_command_window(self):
        """
        Require attention phrase before accepting a new command
        """
        self.ready_for_command = False
        print "End of command window"
        
  
    def run(self):
        """
        Run thread
        """
        self.ready_for_command = False
        while self.running:
            print "recording command..."
            # Run recording command
            subprocess.call(self.record_command)
            
            print "processing command"
            # Check if audio file exists
            try:
                audio = open(self.record_file, 'rb')
                filesize = os.path.getsize(self.record_file)
                req = urllib2.Request(url='https://www.google.com/speech-api/v1/recognize?xjerr=1&client=chromium&lang=' + self.language)
                req.add_header('Content-type','audio/x-flac; rate=16000')
                req.add_header('Content-length', str(filesize))
                req.add_data(audio)
                response = urllib2.urlopen(req)
                print "Response returned:"
                strresponse = response.read()
                response_data = json.loads(strresponse)
                
                if "hypotheses" in response_data:
                    if len(response_data["hypotheses"]) > 0:
                        if "utterance" in response_data["hypotheses"][0]:
                            voice_command = response_data["hypotheses"][0]["utterance"]
                            print "RESPONSE =", voice_command
                            
                            if not self.ready_for_command:
                                if voice_command == self.keyword:
                                    self.parent.confirm_attention()
                                    self.start_command_timer()
                            else:                                    
                                self.notify_speech(voice_command)
                                self.start_command_timer()
                                
                audio.close()
            except IOError:
                pass
        

    def stop(self):
        """
        Stop event manager
        """       
        # Stop speech listener
        self.running = False
        
    
    def notify_speech(self, speech_to_text):
        """
        Notify input speech event
        
        @param speech_to_text speech to text string
        """
        self.parent.notify_speech(speech_to_text)


    def __init__(self, parent, language, keyword):
        """
        Constructor
        
        @param parent object 
        @param language language option
        @param keyword Speech recognition enabling keyword
        """
        threading.Thread.__init__(self)
        
        ## Parent object
        self.parent = parent
        ## language
        self.language = language
        ## Speech recognition enabling keyword
        self.keyword = keyword
                       
        self.record_file = os.path.join(working_dir, "audio", parent.general_settings.record_file)

        strcommand = parent.general_settings.record_command.replace("${audio_file}", self.record_file)
        ## Recording command (list format)
        self.record_command = strcommand.split(' ')
                             
        # Run event handler
        self.running = True
        self.start()


class SpeechManager(LagartoServer):
    """
    Input/Output speech manager
    """
    def notify_speech(self, speech_to_text):
        """
        Notify input speech event
        
        @param speech_to_text speech to text string
        """
        status = []
        self.network.input.value = speech_to_text
        status.append(self.network.input.dumps())
        self.publish_status(status)
        
        
    def get_endpoint(self, endpid=None, location=None, name=None):
        """
        Get endpoint given its unique id or location.name pair
        
        @param endpid endpoint id
        @param location endpoint location
        @param name endpoint name
        
        @return endpoint object
        """
        for endpoint in self.network.endpoints:
            if endpid is not None:
                if endpid == endpoint.id:
                    return endpoint
                elif name == endpoint.name and location == endpoint.location:
                    return endpoint
        return None


    def get_status(self, endpoints):
        """
        Return network status as a list of endpoints in JSON format
        Method required by LagartoServer
        
        @param endpoints: list of endpoints being queried
        
        @return list of endpoints in JSON format
        """
        status = []
        if endpoints is None:
            for endp in self.network.endpoints:
                status.append(endp.dumps())
        else:
            for item in endpoints:
                endp = self.get_endpoint(item["id"], item["location"], item["name"])
                if endp is not None:
                    status.append(endp.dumps())
        
        return status


    def set_status(self, endpoints):
        """
        Set endpoint status
        Method required by LagartoServer
        
        @param endpoints: list of endpoints in JSON format
        
        @return list of endpoints being controlled, with new values
        """
        status = []
        for item in endpoints:
            endp = self.get_endpoint(item["id"], item["location"], item["name"])
            if endp is not None:
                if endp.direction == "out":
                    if "value" in item:
                        if endp.id == "ttsout":
                            value = item["value"]
                            if len(value) > 100:
                                value = value[:99]
                                item["value"] = value
                            self.speech_producer.speak(value)
                        # Build new JSON structure
                        status.append(endp.dumps())

        return status
    
    
    def confirm_attention(self):
        """
        Confirm attention by speaking basic reply
        """
        self.speech_producer.speak(self.general_settings.reply)

    
    def http_command_received(self, command, params):
        """
        Process command sent from HTTP server. Method to be overrided by data server.
        Method required by LagartoServer
        
        @param command: command string
        @param params: dictionary of parameters
        
        @return True if command successfully processed by server.
        Return False otherwise
        """
        try:
            # Configure endpoint
            if command == "config_endpoint":
                endp = self.get_endpoint(endpid=params["id"])
                endp.name = params["name"]
                endp.location = params["location"]
                self.network.save()
                return "endpoint_panel.html"
            # Configure general settings
            elif command == "general_settings":
                self.general_settings.record_command = params["recordcmd"]
                self.general_settings.play_command = params["playcmd"]
                self.general_settings.language = params["language"]
                self.general_settings.keyword = params["keyword"]
                self.general_settings.reply = params["reply"]
                self.general_settings.welcomemsg = params["welcomemsg"]
                    
                # Save config file
                self.general_settings.save()
            else:
                return False
                
        except:
            return False
        
        return True


    def __init__(self):
        """
        Constructor
        """
        # Read config
        config_file = os.path.join(working_dir, "config", "settings.xml")
        self.general_settings = XmlSettings(config_file)

        # Lagarto server constructor
        LagartoServer.__init__(self, working_dir)

        # Network object containing speech-related endpoints
        self.network = SpeechNetwork(self)
       
        # Text to speech engine
        self.speech_producer = SpeachProducer(self, self.general_settings.language)
        self.speech_producer.speak(self.general_settings.welcomemsg)
        # Speech Listener
        SpeechListener(self, self.general_settings.language, self.general_settings.keyword)
