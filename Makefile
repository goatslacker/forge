#
# build tool for forge
# Copyright 2011 Josh Perez <josh@goatslacker.com>
#

.PHONY: all install clean uninstall 

all: install

install:
	@cp ./bin/forge.js /usr/local/bin/forge && \
		chmod 755 /usr/local/bin/forge && \
		echo 'forge installed.'

clean:
	@true

uninstall:
	@rm -f /usr/local/bin/forge && \
		echo 'forge uninstalled.'
