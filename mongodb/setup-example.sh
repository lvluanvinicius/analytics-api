#!/bin/bash


mongo <<EOF
   var cfg = {
        "_id": "analytics-rs",
        "version": 1,
        "members": [
            {
                "_id": 0,
                "host": "localhost:20001",
                "priority": 2
            },
            {
                "_id": 1,
                "host": "localhost:20002",
                "priority": 0
            },
            {
                "_id": 2,
                "host": "localhost:20003",
                "priority": 0
            }
        ]
    };
    rs.initiate(cfg, { force: true });
    //rs.reconfig(cfg, { force: true });
EOF

sleep 15

mongo <<EOF
   use admin;
   admin = db.getSiblingDB("admin");
   admin.createUser(
     {
        user: "admin",
        pwd: "admin",
        roles: [ { role: "root", db: "admin" } ]
     });
     db.getSiblingDB("admin").auth("admin", "admin");     
EOF
