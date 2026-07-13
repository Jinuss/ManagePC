{
  "targets": [
    {
      "target_name": "system",
      "sources": [
        "src/addon.cc",
        "src/screen.cc"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "include"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [
        "NAPI_CPP_EXCEPTIONS"
      ],
      "libraries": [
        "-lshcore.lib"
      ]
    }
  ]
}