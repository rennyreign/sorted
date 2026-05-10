from __future__ import annotations

if __name__ == "operator":
    from _operator import *  # type: ignore  # noqa: F403

    __lt__ = lt  # type: ignore[name-defined]
    __le__ = le  # type: ignore[name-defined]
    __eq__ = eq  # type: ignore[name-defined]
    __ne__ = ne  # type: ignore[name-defined]
    __ge__ = ge  # type: ignore[name-defined]
    __gt__ = gt  # type: ignore[name-defined]
    __not__ = not_  # type: ignore[name-defined]
    __abs__ = abs  # type: ignore[assignment]
    __add__ = add  # type: ignore[name-defined]
    __and__ = and_  # type: ignore[name-defined]
    __floordiv__ = floordiv  # type: ignore[name-defined]
    __index__ = index  # type: ignore[name-defined]
    __inv__ = inv  # type: ignore[name-defined]
    __invert__ = invert  # type: ignore[name-defined]
    __lshift__ = lshift  # type: ignore[name-defined]
    __mod__ = mod  # type: ignore[name-defined]
    __mul__ = mul  # type: ignore[name-defined]
    __matmul__ = matmul  # type: ignore[name-defined]
    __neg__ = neg  # type: ignore[name-defined]
    __or__ = or_  # type: ignore[name-defined]
    __pos__ = pos  # type: ignore[name-defined]
    __pow__ = pow  # type: ignore[assignment]
    __rshift__ = rshift  # type: ignore[name-defined]
    __sub__ = sub  # type: ignore[name-defined]
    __truediv__ = truediv  # type: ignore[name-defined]
    __xor__ = xor  # type: ignore[name-defined]
    __concat__ = concat  # type: ignore[name-defined]
    __contains__ = contains  # type: ignore[name-defined]
    __delitem__ = delitem  # type: ignore[name-defined]
    __getitem__ = getitem  # type: ignore[name-defined]
    __setitem__ = setitem  # type: ignore[name-defined]
else:
    import argparse
    import json
    from pathlib import Path

    from config import ConfigError
    from models import InboundMessage
    from parser import build_cli_inbound, dry_run_plan, parse_update_request
    from router import route_inbound_message


    def run_dry_run(
        message: str | None = None,
        input_path: str | None = None,
        client_id: str | None = None,
    ) -> dict:
        if input_path:
            payload = json.loads(Path(input_path).read_text(encoding="utf-8"))
            inbound = InboundMessage.model_validate(payload)
        elif message:
            inbound = build_cli_inbound(message, client_id=client_id)
        else:
            raise ConfigError("Provide --message or --input.")

        config = route_inbound_message(inbound, explicit_client_id=client_id)
        request = parse_update_request(inbound, config)
        plan = dry_run_plan(request, config)
        return plan.model_dump(mode="json")


    def main() -> None:
        parser = argparse.ArgumentParser(description="Sorted Updates Client Website Operator dry-run CLI")
        parser.add_argument("--client", help="Client id, for example gbhalesowen")
        parser.add_argument("--message", help="WhatsApp-style message body")
        parser.add_argument("--input", help="Path to an inbound message JSON file")
        args = parser.parse_args()

        output = run_dry_run(message=args.message, input_path=args.input, client_id=args.client)
        print(json.dumps(output, indent=2))


    if __name__ == "__main__":
        main()
