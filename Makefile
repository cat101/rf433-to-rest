
# Defines the RPI variable which is needed by rc-switch/RCSwitch.h
CXXFLAGS=-DRPI

all: RFSniffer

	
RFSniffer: node_modules/rc-switch/RCSwitch.o RFSniffer.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $+ -o $@ -lwiringPi
	
clean:
	$(RM) node_modules/rc-switch/*.o *.o RFSniffer

