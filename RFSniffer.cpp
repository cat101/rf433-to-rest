/*
  RFSniffer

  Hacked from http://code.google.com/p/rc-switch/
  by @justy to provide a handy RF code sniffer
  Productized by cat101
*/

#include "node_modules/rc-switch/RCSwitch.h"
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <time.h>
#include <ctype.h>
#include <wiringPi.h>

RCSwitch mySwitch;
 
// extern unsigned int duration;
// extern unsigned int test;

void print_usage() {
    printf("Usage: RFSniffer [-p pin]\n");
}

int main(int argc, char *argv[]) {
  
  // This pin is not the first pin on the RPi GPIO header!
  // Consult https://projects.drogon.net/raspberry-pi/wiringpi/pins/
  // for more information.
  int PIN = 2;

  if(wiringPiSetup() == -1) {
   fprintf (stderr,"wiringPiSetup failed, exiting...\n");
   exit(1);
  }

  mySwitch = RCSwitch();

  opterr = 0;
  int c;
  while ((c = getopt (argc, argv, "p:")) != -1){
    switch (c){
      case 'p':
        PIN = atoi(optarg);
      break;
      case '?':
        print_usage(); 
        if (isprint (optopt))
         fprintf (stderr, "Unknown option `-%c'.\n", optopt);
        else
         fprintf (stderr, "Unknown option character `\\x%x'.\n", optopt);
        exit(1);
      default:
        print_usage(); 
        abort ();
    }
  }

  // mySwitch.setReceiveTolerance(80);
  pullUpDnControl (PIN, PUD_OFF); // Disable internal pull downs
  mySwitch.enableReceive(PIN);  // Receiver on interrupt 0 => that is pin #2
  // unsigned long arduinocodeLast;
  struct timespec tim, tim2;
  tim.tv_sec = 0;
  tim.tv_nsec = 100L * 1000L * 1000L; //100ms

  while(1) {  
    if (mySwitch.available()) {
      int value = mySwitch.getReceivedValue();
      if (value == 0) {
        printf("Unknown encoding\n");
      } else {    
        unsigned long code=mySwitch.getReceivedValue();
        // unsigned long arduinocode=mySwitch.getReceivedValue() ^ 0xFFFFFF;
        // if(arduinocodeLast==arduinocode){
          // Debounce packets
          printf("{\"code\":\"0x%08lX\", \"bits\":\"%u\", \"protocol\":\"%u\", \"delay\":\"%u\"}\n"
            ,code
            ,mySwitch.getReceivedBitlength()
            ,mySwitch.getReceivedProtocol()            
            ,mySwitch.getReceivedDelay()
          );

          // printf("Received 0x%08lX (bits %u, delay %u, prot %u)\n", arduinocode
          //   ,mySwitch.getReceivedBitlength()
          //   ,mySwitch.getReceivedDelay()
          //   ,mySwitch.getReceivedProtocol());            
          sleep(1);
        //   arduinocodeLast=0;
        // }else{
        //   arduinocodeLast=arduinocode;
        // }
      }
      mySwitch.resetAvailable();
    }
    nanosleep(&tim , &tim2); //Sleep 
  }
  exit(0);
}
