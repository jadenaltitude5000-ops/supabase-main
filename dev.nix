{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    # your other packages
    pkgs.supabase-cli
  ];
}
